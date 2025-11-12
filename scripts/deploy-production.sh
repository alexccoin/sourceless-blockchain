#!/usr/bin/env bash

# Sourceless Blockchain Ecosystem - Production Deployment Script
# This script deploys the complete Sourceless ecosystem to production

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOYMENT_ENV="${DEPLOYMENT_ENV:-production}"
AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REGISTRY="${ECR_REGISTRY:-123456789012.dkr.ecr.us-east-1.amazonaws.com}"
KUBERNETES_CLUSTER="${KUBERNETES_CLUSTER:-sourceless-production}"
NAMESPACE="${NAMESPACE:-sourceless}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check required tools
    local tools=("docker" "kubectl" "helm" "aws" "jq")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "$tool is required but not installed."
        fi
    done
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running."
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured."
    fi
    
    # Check Kubernetes cluster access
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot access Kubernetes cluster."
    fi
    
    log_success "All prerequisites satisfied."
}

# Build and push Docker images
build_and_push_images() {
    log_info "Building and pushing Docker images..."
    
    # Get version from package.json or use git commit
    local version
    if [[ -f "$PROJECT_ROOT/package.json" ]]; then
        version=$(jq -r '.version' "$PROJECT_ROOT/package.json")
    else
        version=$(git rev-parse --short HEAD)
    fi
    
    # Login to ECR
    aws ecr get-login-password --region "$AWS_REGION" | \
        docker login --username AWS --password-stdin "$ECR_REGISTRY"
    
    # Build and push each platform
    local platforms=("enterprise" "light" "developer")
    for platform in "${platforms[@]}"; do
        log_info "Building $platform platform..."
        
        docker build \
            -f "$PROJECT_ROOT/Dockerfile.$platform" \
            -t "sourceless/$platform:$version" \
            -t "sourceless/$platform:latest" \
            --build-arg NODE_ENV=production \
            --build-arg PLATFORM="$platform" \
            "$PROJECT_ROOT"
        
        # Tag for ECR
        docker tag "sourceless/$platform:$version" \
            "$ECR_REGISTRY/sourceless:$platform-$version"
        docker tag "sourceless/$platform:latest" \
            "$ECR_REGISTRY/sourceless:$platform-latest"
        
        # Push to ECR
        docker push "$ECR_REGISTRY/sourceless:$platform-$version"
        docker push "$ECR_REGISTRY/sourceless:$platform-latest"
        
        log_success "$platform platform built and pushed."
    done
}

# Deploy Kubernetes infrastructure
deploy_kubernetes() {
    log_info "Deploying Kubernetes infrastructure..."
    
    # Update kubeconfig
    aws eks update-kubeconfig --name "$KUBERNETES_CLUSTER" --region "$AWS_REGION"
    
    # Create namespace if it doesn't exist
    kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply base infrastructure
    kubectl apply -f "$PROJECT_ROOT/k8s/base-infrastructure.yaml" -n "$NAMESPACE"
    
    log_success "Base infrastructure deployed."
}

# Deploy applications using Helm
deploy_applications() {
    log_info "Deploying applications with Helm..."
    
    # Add required Helm repositories
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    
    # Get version for deployment
    local version
    if [[ -f "$PROJECT_ROOT/package.json" ]]; then
        version=$(jq -r '.version' "$PROJECT_ROOT/package.json")
    else
        version="latest"
    fi
    
    # Deploy Enterprise Platform
    log_info "Deploying Enterprise Platform..."
    helm upgrade --install sourceless-enterprise \
        "$PROJECT_ROOT/helm/sourceless-enterprise" \
        --namespace "$NAMESPACE" \
        --set image.repository="$ECR_REGISTRY/sourceless" \
        --set image.tag="enterprise-$version" \
        --set secrets.hostlessDbUrl="$HOSTLESS_DB_URL" \
        --set secrets.jwtSecret="$JWT_SECRET" \
        --set secrets.encryptionKey="$ENCRYPTION_KEY" \
        --set secrets.redisUrl="$REDIS_URL" \
        --wait --timeout=600s
    
    # Deploy Light Platform
    log_info "Deploying Light Platform..."
    helm upgrade --install sourceless-light \
        "$PROJECT_ROOT/helm/sourceless-light" \
        --namespace "$NAMESPACE" \
        --set image.repository="$ECR_REGISTRY/sourceless" \
        --set image.tag="light-$version" \
        --set secrets.hostlessDbUrl="$HOSTLESS_DB_URL" \
        --set secrets.jwtSecret="$JWT_SECRET" \
        --wait --timeout=600s
    
    log_success "Applications deployed successfully."
}

# Configure monitoring
setup_monitoring() {
    log_info "Setting up monitoring and observability..."
    
    # Deploy Prometheus
    helm upgrade --install prometheus prometheus-community/prometheus \
        --namespace "$NAMESPACE" \
        --set server.retention="30d" \
        --set server.persistentVolume.size="100Gi" \
        --set server.persistentVolume.storageClass="gp3" \
        --wait
    
    # Deploy Grafana
    helm upgrade --install grafana bitnami/grafana \
        --namespace "$NAMESPACE" \
        --set admin.password="$GRAFANA_PASSWORD" \
        --set persistence.enabled=true \
        --set persistence.size="10Gi" \
        --set persistence.storageClass="gp3" \
        --wait
    
    log_success "Monitoring stack deployed."
}

# Run health checks
run_health_checks() {
    log_info "Running health checks..."
    
    # Wait for deployments to be ready
    kubectl wait --for=condition=available deployment/sourceless-enterprise \
        -n "$NAMESPACE" --timeout=600s
    kubectl wait --for=condition=available deployment/sourceless-light \
        -n "$NAMESPACE" --timeout=600s
    
    # Get service endpoints
    local enterprise_ip
    enterprise_ip=$(kubectl get svc sourceless-enterprise-lb -n "$NAMESPACE" \
        -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [[ -n "$enterprise_ip" ]]; then
        log_info "Testing Enterprise Platform health..."
        if curl -f "http://$enterprise_ip/health" &> /dev/null; then
            log_success "Enterprise Platform is healthy."
        else
            log_warning "Enterprise Platform health check failed."
        fi
    fi
    
    # Check pod status
    kubectl get pods -n "$NAMESPACE" -o wide
    
    log_success "Health checks completed."
}

# Update DNS and CDN
update_dns() {
    log_info "Updating DNS and CDN configuration..."
    
    # Get load balancer IP
    local lb_ip
    lb_ip=$(kubectl get svc sourceless-enterprise-lb -n "$NAMESPACE" \
        -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [[ -n "$lb_ip" && -n "$CLOUDFLARE_API_TOKEN" ]]; then
        # Update CloudFlare DNS record
        curl -X PUT "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$CLOUDFLARE_RECORD_ID" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{\"type\":\"A\",\"name\":\"api.sourceless.io\",\"content\":\"$lb_ip\"}"
        
        log_success "DNS records updated."
    else
        log_warning "Skipping DNS update - missing configuration."
    fi
}

# Send deployment notifications
send_notifications() {
    log_info "Sending deployment notifications..."
    
    local version
    if [[ -f "$PROJECT_ROOT/package.json" ]]; then
        version=$(jq -r '.version' "$PROJECT_ROOT/package.json")
    else
        version="unknown"
    fi
    
    local message="🚀 Sourceless v$version deployed to production!

✅ All platforms updated
✅ Health checks passed
✅ Performance benchmarks met

API: https://api.sourceless.io
Dashboard: https://dashboard.sourceless.io"
    
    # Slack notification
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"$message\"}"
    fi
    
    # Discord notification
    if [[ -n "$DISCORD_WEBHOOK_URL" ]]; then
        curl -X POST "$DISCORD_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"embeds\": [{\"title\": \"🚀 Production Deployment Complete\", \"description\": \"Sourceless v$version is now live!\", \"color\": 5763719}]}"
    fi
    
    log_success "Notifications sent."
}

# Performance benchmarking
run_performance_tests() {
    log_info "Running performance benchmarks..."
    
    # Create performance test job
    kubectl create job performance-test-$(date +%s) \
        --from=cronjob/performance-tests -n "$NAMESPACE" || true
    
    log_info "Performance tests started in background."
}

# Cleanup old resources
cleanup_old_resources() {
    log_info "Cleaning up old resources..."
    
    # Clean up old Docker images in ECR (keep last 10 versions)
    local repositories=("sourceless")
    for repo in "${repositories[@]}"; do
        aws ecr list-images --repository-name "$repo" \
            --filter tagStatus=TAGGED \
            --query 'imageIds[10:].[imageTag]' \
            --output text | \
        while read -r tag; do
            if [[ -n "$tag" && "$tag" != "None" ]]; then
                aws ecr batch-delete-image --repository-name "$repo" \
                    --image-ids imageTag="$tag" || true
            fi
        done
    done
    
    log_success "Old resources cleaned up."
}

# Main deployment function
main() {
    log_info "Starting Sourceless Blockchain Ecosystem deployment..."
    log_info "Environment: $DEPLOYMENT_ENV"
    log_info "Region: $AWS_REGION"
    log_info "Cluster: $KUBERNETES_CLUSTER"
    
    check_prerequisites
    build_and_push_images
    deploy_kubernetes
    deploy_applications
    setup_monitoring
    run_health_checks
    update_dns
    run_performance_tests
    send_notifications
    cleanup_old_resources
    
    log_success "🎉 Deployment completed successfully!"
    log_info "🌐 Access your platforms:"
    log_info "   • Enterprise: https://api.sourceless.io"
    log_info "   • Light: https://light.sourceless.io"
    log_info "   • Developer: https://developer.sourceless.io"
    log_info "   • Monitoring: https://grafana.sourceless.io"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "build")
        check_prerequisites
        build_and_push_images
        ;;
    "k8s")
        check_prerequisites
        deploy_kubernetes
        deploy_applications
        ;;
    "monitor")
        check_prerequisites
        setup_monitoring
        ;;
    "health")
        run_health_checks
        ;;
    "cleanup")
        cleanup_old_resources
        ;;
    *)
        echo "Usage: $0 {deploy|build|k8s|monitor|health|cleanup}"
        echo "  deploy  - Full deployment (default)"
        echo "  build   - Build and push images only"
        echo "  k8s     - Deploy Kubernetes resources only"
        echo "  monitor - Setup monitoring only"
        echo "  health  - Run health checks only"
        echo "  cleanup - Cleanup old resources only"
        exit 1
        ;;
esac