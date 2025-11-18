
/**
 * 🤝 REAL-TIME COLLABORATION SYSTEM
 * Multi-developer code editing (VS Code Live Share style)
 */
const WebSocket = require('ws');

class RealTimeCollaboration {
    constructor() {
        this.sessions = new Map();
        this.wss = new WebSocket.Server({ port: 8080 });
        this.setupWebSocketServer();
        
        console.log('🤝 Real-time collaboration server started on port 8080');
    }

    setupWebSocketServer() {
        this.wss.on('connection', (ws) => {
            ws.on('message', (message) => {
                this.handleMessage(ws, JSON.parse(message));
            });

            ws.on('close', () => {
                this.handleDisconnection(ws);
            });
        });
    }

    handleMessage(ws, message) {
        switch (message.type) {
            case 'JOIN_SESSION':
                this.joinSession(ws, message.sessionId, message.userId);
                break;
            case 'CODE_CHANGE':
                this.broadcastCodeChange(ws, message);
                break;
            case 'CURSOR_POSITION':
                this.broadcastCursorPosition(ws, message);
                break;
            case 'CHAT_MESSAGE':
                this.broadcastChatMessage(ws, message);
                break;
        }
    }

    joinSession(ws, sessionId, userId) {
        if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, {
                participants: new Map(),
                code: '',
                cursors: new Map()
            });
        }

        const session = this.sessions.get(sessionId);
        session.participants.set(userId, { ws, userId, color: this.generateColor() });

        ws.sessionId = sessionId;
        ws.userId = userId;

        // Send current state to new participant
        ws.send(JSON.stringify({
            type: 'SESSION_STATE',
            code: session.code,
            participants: Array.from(session.participants.keys()),
            cursors: Object.fromEntries(session.cursors)
        }));

        // Notify other participants
        this.broadcastToSession(sessionId, {
            type: 'PARTICIPANT_JOINED',
            userId,
            participants: Array.from(session.participants.keys())
        }, userId);

        console.log(`👤 User ${userId} joined session ${sessionId}`);
    }

    broadcastCodeChange(senderWs, message) {
        const session = this.sessions.get(senderWs.sessionId);
        if (!session) return;

        // Apply operational transformation to resolve conflicts
        const transformedChanges = this.applyOperationalTransform(
            session.code,
            message.changes
        );

        session.code = this.applyChanges(session.code, transformedChanges);

        // Broadcast to all participants except sender
        this.broadcastToSession(senderWs.sessionId, {
            type: 'CODE_CHANGED',
            changes: transformedChanges,
            userId: senderWs.userId
        }, senderWs.userId);
    }

    applyOperationalTransform(currentCode, changes) {
        // Simplified operational transformation
        // Production version would implement full OT algorithm
        return changes.map(change => ({
            ...change,
            position: this.adjustPosition(change.position, currentCode)
        }));
    }

    adjustPosition(position, code) {
        // Adjust position based on concurrent changes
        return position; // Simplified version
    }

    applyChanges(code, changes) {
        let result = code;
        
        // Apply changes in reverse order to maintain positions
        changes.sort((a, b) => b.position - a.position);
        
        changes.forEach(change => {
            if (change.type === 'insert') {
                result = result.slice(0, change.position) + 
                         change.text + 
                         result.slice(change.position);
            } else if (change.type === 'delete') {
                result = result.slice(0, change.position) + 
                         result.slice(change.position + change.length);
            }
        });

        return result;
    }

    broadcastCursorPosition(senderWs, message) {
        const session = this.sessions.get(senderWs.sessionId);
        if (!session) return;

        session.cursors.set(senderWs.userId, message.position);

        this.broadcastToSession(senderWs.sessionId, {
            type: 'CURSOR_MOVED',
            userId: senderWs.userId,
            position: message.position
        }, senderWs.userId);
    }

    broadcastToSession(sessionId, message, excludeUserId = null) {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        session.participants.forEach((participant, userId) => {
            if (userId !== excludeUserId) {
                participant.ws.send(JSON.stringify(message));
            }
        });
    }

    generateColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    handleDisconnection(ws) {
        if (ws.sessionId && ws.userId) {
            const session = this.sessions.get(ws.sessionId);
            if (session) {
                session.participants.delete(ws.userId);
                session.cursors.delete(ws.userId);

                this.broadcastToSession(ws.sessionId, {
                    type: 'PARTICIPANT_LEFT',
                    userId: ws.userId,
                    participants: Array.from(session.participants.keys())
                });

                console.log(`👤 User ${ws.userId} left session ${ws.sessionId}`);
            }
        }
    }
}

module.exports = RealTimeCollaboration;