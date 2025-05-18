This is a simple application that demonstrates how a classic application can be implemented with Event Sourcing.

## Getting Started

First, run the development server:

```bash
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure
This document won't cover any UI components as the main focus is on the backend. 

[repository.ts](./src/be/repository.ts) holds interfaces that represent data model and data access layer. <br/>
[repository-provider.ts](./src/be/repo-provider.ts) provides either a "classic" or an Event Sourcing implementation of the repository. 
