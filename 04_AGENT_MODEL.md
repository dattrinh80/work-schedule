# Agent Model

## Orchestrator

Does not implement product code. Owns routing, state, budgets, approvals, evidence collection and terminal decisions.

## Planner

Analyzes repository impact and creates an implementation plan. May not edit product source.

## Frontend Worker

Owns presentation, interaction, client state, API integration, accessibility and responsive behavior. May not change product contracts without a change request.

## Backend Worker

Owns API implementation, domain/application logic, authorization, validation and data access. May not unilaterally change public contracts or architecture.

## Test Worker

Derives tests from acceptance criteria and contracts, including negative and permission cases.

## Reviewer

Read-only by default. Reviews diff scope, architecture, quality, security and evidence.

## Specialists

Architecture, Database, UX and Security specialists are invoked on demand.
