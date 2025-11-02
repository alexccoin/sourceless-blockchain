// Sourceless Blockchain v0.13 - Governance Ledger
// Ledger for DAO proposals, voting, and governance actions

import { Blockchain } from '../core/Blockchain';
import { Transaction } from '../core/Transaction';
import { Proposal } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';

export class GovernanceLedger extends Blockchain {
  private proposals: Map<string, Proposal>;
  private votes: Map<string, Map<string, 'yes' | 'no' | 'abstain'>>;

  constructor(difficulty: number = 2) {
    super('governance', difficulty);
    this.miningReward = 25;
    this.proposals = new Map();
    this.votes = new Map();
  }

  // Create a new proposal
  createProposal(
    proposer: string,
    title: string,
    description: string,
    votingPeriod: number = 7 * 24 * 60 * 60 * 1000 // 7 days
  ): string | null {
    const proposalId = uuidv4();

    const proposal: Proposal = {
      id: proposalId,
      title,
      description,
      proposer,
      votes: {
        yes: 0,
        no: 0,
        abstain: 0
      },
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + votingPeriod
    };

    const transaction = new Transaction(
      proposer,
      'governance',
      0,
      'governance',
      0.1,
      { type: 'create-proposal', proposal }
    );

    if (this.addTransaction(transaction)) {
      this.proposals.set(proposalId, proposal);
      this.votes.set(proposalId, new Map());
      console.log(`Proposal "${title}" created by ${proposer}`);
      return proposalId;
    }

    return null;
  }

  // Cast a vote on a proposal
  vote(
    proposalId: string,
    voter: string,
    voteType: 'yes' | 'no' | 'abstain',
    votingPower: number = 1
  ): boolean {
    const proposal = this.proposals.get(proposalId);

    if (!proposal) {
      console.error('Proposal not found');
      return false;
    }

    if (proposal.status !== 'active' && proposal.status !== 'pending') {
      console.error('Proposal is not active');
      return false;
    }

    if (Date.now() > proposal.expiresAt) {
      console.error('Voting period has ended');
      return false;
    }

    const proposalVotes = this.votes.get(proposalId);
    if (!proposalVotes) {
      console.error('Proposal votes not initialized');
      return false;
    }

    // Check if already voted
    if (proposalVotes.has(voter)) {
      console.error('Already voted on this proposal');
      return false;
    }

    const transaction = new Transaction(
      voter,
      'governance',
      0,
      'governance',
      0.01,
      { type: 'vote', proposalId, voteType, votingPower }
    );

    if (this.addTransaction(transaction)) {
      // Record vote
      proposalVotes.set(voter, voteType);
      proposal.votes[voteType] += votingPower;
      
      if (proposal.status === 'pending') {
        proposal.status = 'active';
      }

      this.proposals.set(proposalId, proposal);
      console.log(`${voter} voted ${voteType} on proposal ${proposalId}`);
      return true;
    }

    return false;
  }

  // Finalize a proposal
  finalizeProposal(proposalId: string): boolean {
    const proposal = this.proposals.get(proposalId);

    if (!proposal) {
      console.error('Proposal not found');
      return false;
    }

    if (Date.now() < proposal.expiresAt) {
      console.error('Voting period has not ended');
      return false;
    }

    const totalVotes = proposal.votes.yes + proposal.votes.no + proposal.votes.abstain;
    const requiredQuorum = 100; // Minimum votes required
    const requiredMajority = 0.5; // 50% + 1

    if (totalVotes < requiredQuorum) {
      proposal.status = 'rejected';
      console.log(`Proposal ${proposalId} rejected - quorum not met`);
    } else {
      const yesRatio = proposal.votes.yes / (proposal.votes.yes + proposal.votes.no);
      proposal.status = yesRatio > requiredMajority ? 'passed' : 'rejected';
      console.log(`Proposal ${proposalId} ${proposal.status}`);
    }

    this.proposals.set(proposalId, proposal);
    return true;
  }

  // Get all active proposals
  getActiveProposals(): Proposal[] {
    const active: Proposal[] = [];

    for (const proposal of this.proposals.values()) {
      if (proposal.status === 'active' || proposal.status === 'pending') {
        active.push(proposal);
      }
    }

    return active;
  }

  // Get proposal by ID
  getProposal(proposalId: string): Proposal | undefined {
    return this.proposals.get(proposalId);
  }

  // Get governance ledger stats
  getGovernanceLedgerStats() {
    const baseStats = this.getStats();
    let activeProposals = 0;
    let passedProposals = 0;
    let rejectedProposals = 0;

    for (const proposal of this.proposals.values()) {
      if (proposal.status === 'active') activeProposals++;
      if (proposal.status === 'passed') passedProposals++;
      if (proposal.status === 'rejected') rejectedProposals++;
    }

    return {
      ...baseStats,
      totalProposals: this.proposals.size,
      activeProposals,
      passedProposals,
      rejectedProposals,
      ledgerType: 'Governance Ledger (DAO & Voting)'
    };
  }
}
