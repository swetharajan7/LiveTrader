LiveTrader.ai

An autonomous AI trading coach built on AWS — LiveTrader.ai analyzes your trading habits, monitors real-time market data, and delivers explainable, proactive insights to help you trade smarter and safer.

🚀 Overview

Traders often repeat costly mistakes: cutting winners too early, holding losers too long, or ignoring risk exposure. LiveTrader.ai solves this by acting as a personal AI trading coach.

Hosted entirely on AWS Bedrock with AgentCore primitives.

Uses reasoning LLMs to plan, decide, and act autonomously.

Integrates with market data APIs and a user’s trade history.

Provides daily autonomous insights as well as on-demand coaching.

Explains every suggestion with clear, evidence-backed reasoning.

This project was built as part of the AWS Agent Hackathon 2025, and designed to showcase how autonomous agents on AWS can deliver real value in finance while being extensible to other domains.

✨ Features

Coach Me Now → Run the agent on demand to analyze your trades and current market signals.

Pre-Trade Nudge → Enter a planned trade and get a “green/yellow/red” risk signal with an explanation.

Autonomous Daily Check → Agent runs automatically every morning via EventBridge and posts fresh insights.

Explainability → Every insight includes the agent’s plan, evidence from tools, and rationale.

Trade Journal Integration → Upload past trades (CSV) or connect to a paper trading API.

🧠 How It Works

LiveTrader.ai uses an agentic loop built on Amazon Bedrock AgentCore:

Plan — The agent defines a coaching goal (e.g., “Evaluate today’s risk vs. the user’s profile”).

Act — Calls registered tools:

get_market_snapshot(ticker) → real-time quotes/volatility

compute_risk_metrics(trades) → max drawdown, win rate, exposure

paper_trade(order) → simulate test trades (optional)

Observe — Updates memory in DynamoDB.

Reflect — Produces a recommendation with confidence and rationale.

Autonomy is enabled via EventBridge, which schedules the agent to run without human input. All insights are stored in DynamoDB and displayed in a React dashboard hosted on AWS Amplify.

🏗️ Architecture

Components:

Frontend (React) — Hosted on Amplify / CloudFront.

API Gateway — Entry point for frontend → backend calls.

Lambda (Orchestrator) — Runs the agent loop.

Amazon Bedrock — Reasoning LLM + AgentCore for planning & tool use.

Lambda Tools — Market data fetcher, risk metrics calculator, paper trading.

DynamoDB — Stores users, trades, insights, memory.

EventBridge — Triggers daily autonomous runs.

CloudWatch — Logs, metrics, error tracking.

🛠️ Tech Stack

AWS Services: Bedrock, AgentCore, DynamoDB, EventBridge, API Gateway, Lambda, Amplify, CloudWatch

Frontend: React + TailwindCSS

Backend: Python (FastAPI + AWS SDK for Agents)

Data APIs: Polygon.io / Alpha Vantage (market data)

Optional: Alpaca paper trading sandbox

MIT License. 
