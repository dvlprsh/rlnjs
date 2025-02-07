import {
  IncrementalMerkleTree,
} from "@zk-kit/incremental-merkle-tree";
import { buildPoseidon } from "../utils";
import { Member } from "./types";

export default class Registry {
  private _merkleTree: IncrementalMerkleTree;
  private _treeDepth: number;
  private _zeroValue: Member;

  /**
   * Initializes the group with the tree depth and the zero value.
   * @param treeDepth Tree depth.
   * @param zeroValue Zero values for zeroes.
   */
  constructor(treeDepth = 20, zeroValue: Member = BigInt(0)) {
    if (treeDepth < 16 || treeDepth > 32) {
      throw new Error("The tree depth must be between 16 and 32");
    }
    this._treeDepth = treeDepth
    this._zeroValue = zeroValue
  }

  /**
   * Returns the root hash of the tree.
   * @returns Root hash.
   */
  get root(): Member {
    return this._merkleTree.root;
  }

  /**
   * Returns the depth of the tree.
   * @returns Tree depth.
   */
  get depth(): number {
    return this._merkleTree.depth;
  }

  /**
   * Returns the zero value of the tree.
   * @returns Tree zero value.
   */
  get zeroValue(): Member {
    return this._merkleTree.zeroes[0];
  }

  /**
   * Returns the members (i.e. identity commitments) of the group.
   * @returns List of members.
   */
  get members(): Member[] {
    return this._merkleTree.leaves;
  }

  async init() {
    const poseidon = await buildPoseidon()

    this._merkleTree = new IncrementalMerkleTree(
      poseidon,
      this._treeDepth,
      this._zeroValue,
      2
    );
  }

  /**
   * Returns the index of a member. If the member does not exist it returns -1.
   * @param member Group member.
   * @returns Index of the member.
   */
  indexOf(member: Member): number {
    return this._merkleTree.indexOf(member);
  }

  /**
   * Adds a new member to the group.
   * @param identityCommitment New member.
   */
  addMember(identityCommitment: Member) {
    this._merkleTree.insert(BigInt(identityCommitment));
  }

  /**
   * Adds new members to the group.
   * @param identityCommitments New members.
   */
  addMembers(identityCommitments: Member[]) {
    for (const identityCommitment of identityCommitments) {
      this.addMember(identityCommitment);
    }
  }

  /**
   * Removes a member from the group.
   * @param index Index of the member to be removed.
   */
  removeMember(index: number) {
    this._merkleTree.delete(index);
  }
}
