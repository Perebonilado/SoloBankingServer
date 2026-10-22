# Responsible use of AI

We designed SoloBanking ourselves and used AI as a supporting tool.

## 1. We designed it first

Before writing any code, we wrote the plan ourselves: every service, its payload, the login flow and the database tables.

![Our plan for the services: login, beneficiaries, bank lookup and verification](images/plan-services.png)

![Our plan for transfers and the database tables](images/plan-transfers-and-tables.png)

That plan set the rules the code had to follow:

- Log in with an account number and an encrypted passkey.
- Keep bank lookups behind our own interface, with Paystack as one implementation.
- Run every transfer inside a database transaction, so a balance can never be half-updated.
- No sign-up yet.

## 2. AI helped us debug

We found each of these problems ourselves while running the app. We used an AI assistant (Claude Code) to trace the cause, then checked the fix ourselves:

- **The call screen dropped mid-call.** After a failed fingerprint step, the app showed the microphone screen even though the call was still live. The cause was the voice SDK marking the whole session as failed when one tool errored. We now track the call's connection separately.
- **Account lookup returned a 502.** Resolving a bank account failed because the Paystack key was missing from our local settings.
- **The receipt didn't appear when asked for.** After a payment, asking the agent to show the receipt did nothing. The agent had no tool for it, so we added tools to show and close the receipt.
- **Calls ended abruptly.** We traced this to the voice provider's account running out of credits, not to our code.
