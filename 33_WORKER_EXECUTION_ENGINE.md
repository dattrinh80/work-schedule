# Worker Execution Engine - v4.1

## Purpose

Coordinate multiple coding workers without letting them compete for the same files, contracts or decisions.

## Core concepts

- Work Item
- Worker Role
- Ownership
- File/Path Lease
- Worker Queue
- Branch State
- Worker Evidence
- Integration Contract

## Worker lifecycle

PENDING -> CLAIMED -> RUNNING -> VERIFYING -> DONE

Alternative terminal states:
FAILED, BLOCKED, CANCELLED.

## Rule

A worker may only edit paths covered by its active ownership lease.
