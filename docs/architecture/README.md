# Digital Therapy Assistant - C4 Architecture Diagrams



## Diagrams

### Level 1: System Context (`c4-context.puml`)

The highest-level view showing the Digital Therapy Assistant system in relation to its users and external systems. This diagram answers the question: "What is the system and who/what interacts with it?"

**Users:** Patient, Therapist, System Administrator, AI Client (Claude Desktop / Claude Code via MCP)

**External systems:** Anthropic Claude API (LLM provider), Email Service, Healthcare EHR Systems, GitHub (CI/CD pipeline), GitHub Container Registry (Docker image storage), AWS EC2 (cloud deployment target)

### Level 2: Container (`c4-container.puml`)

Zooms into the Digital Therapy Assistant system boundary to show the major containers running inside Docker Compose on AWS EC2. This diagram shows how containers communicate, which technologies they use, and their port mappings.

**Containers:** Frontend (Nginx + React, port 3000), Spring Boot Backend (Java 21, port 8080), MCP Server (stdio, embedded in Spring Boot), H2 Database (file volume), SimpleVector Store (file volume), Knowledge Base (read-only bind mount)

The Frontend acts as a reverse proxy, forwarding `/api/*` requests to the Spring Boot backend on port 8080.

### Level 3: Component (`c4-component.puml`)

Zooms into the Spring Boot Application container to show its internal components: REST controllers (Auth, Session, Diary, Progress, Crisis), service layer (AuthService, SessionService, DiaryService, ProgressService, CrisisService, AiService), data repositories, and infrastructure components (RagContextBuilder, LlmClient, CrisisDetector, JWT security). This diagram shows the component-level architecture and their dependencies.

### Level 4: Code (`c4-code.puml`)

Contains three diagrams that zoom into the code level:

- **Class Diagram (AI Service Module):** Shows the class structure of the AI subsystem including the `AiService` interface, `LlmClient`, `RagContextBuilder`, `SimpleVectorStore`, `CrisisDetector`, `EmbeddingService`, and `KnowledgeBaseLoader` with their fields, methods, and relationships.
- **Sequence Diagram (Chat Message Flow):** Traces a user chat message from the Frontend through the SessionController, SessionService, AiService (with RAG context building and crisis detection), and back to the user with the AI-generated therapeutic response.
- **Sequence Diagram (Diary Entry with AI Analysis):** Traces the creation of a thought diary entry, including the AI-powered cognitive distortion suggestion step and the subsequent entry persistence.

### Deployment (`c4-deployment.puml`) — *New in Assignment 3*

Shows the full runtime topology of the system deployed on AWS EC2. Covers:

- **AWS EC2 instance** with Elastic IP running Ubuntu 22.04 LTS
- **Docker Compose** orchestrating the frontend and backend containers
- **Security group rules** — inbound ports 22 (SSH), 3000 (Frontend), 8080 (Backend)
- **Named Docker volumes** for H2 database and SimpleVectorStore persistence
- **Secrets management** via a `.env` file injected at container startup (ANTHROPIC_API_KEY, JWT_SECRET, DB_PATH, VECTOR_STORE_PATH)
- **External connections** to the Anthropic Claude API and GitHub Container Registry

### CI/CD Pipeline (`c4-pipeline.puml`) — *New in Assignment 3*

Shows the stage-gate CI/CD/CD pipeline implemented with GitHub Actions. Covers:

- **CI workflow** — Build gate followed by five parallel checks: Unit Tests, Integration Tests, Code Quality, Dependency Check, Security Scan
- **CD Build workflow** — Build Docker images, push to GitHub Container Registry (tagged by git SHA and `latest`), Smoke Test
- **CD Deploy workflow** — SSH deploy to EC2 via `docker compose pull && up -d`, post-deployment health verification of both frontend (port 3000) and backend (port 8080)
- **Gates** between each stage — a failed gate blocks all downstream stages and leaves the previous stable image running on EC2

## File Summary

| File | Level | Description |
|---|---|---|
| `c4-context.puml` | L1 | System context — users and external systems |
| `c4-container.puml` | L2 | Containers — Docker services and communication |
| `c4-component.puml` | L3 | Components — Spring Boot internals |
| `c4-code.puml` | L4 | Code — class diagram and sequence diagrams |
| `c4-deployment.puml` | Deployment | AWS EC2 + Docker Compose topology |
| `c4-pipeline.puml` | Pipeline | GitHub Actions CI/CD/CD stage-gate flow |

## Rendering the Diagrams

These `.puml` files can be rendered using:

- **PlantUML Online Server:** Paste the contents at [https://www.plantuml.com/plantuml/uml](https://www.plantuml.com/plantuml/uml)
- **VS Code:** Install the "PlantUML" extension by jebbs
- **IntelliJ IDEA:** Install the "PlantUML Integration" plugin
- **Command Line:** `java -jar plantuml.jar c4-context.puml`
