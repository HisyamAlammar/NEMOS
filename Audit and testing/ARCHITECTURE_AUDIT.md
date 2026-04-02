# NEMOS Architecture Audit Report

**Principal Software Architect & Systems Analyst Report**

This document contains a comprehensive architectural and component-level audit of the NEMOS ecosystem, utilizing PlantUML and DBML for structural mapping, system design overviews, and system interaction visualisations.

---

## 1. Entity Relationship Diagram (ERD)

The following schema maps the database models from `schema.prisma`. 

```plantuml
@startuml
skinparam roundcorner 5
skinparam linetype ortho
skinparam shadowing false
skinparam handwritten false
skinparam class {
    BackgroundColor white
    ArrowColor #2688d4
    BorderColor #2688d4
}

entity "User" as user {
  * id : String <<PK>>
  --
  * email : String <<unique>>
  * password : String
  * name : String
  * role : Role
  * tier : Tier
  riskProfile : RiskProfile
  * learningProgress : Int
  * createdAt : DateTime
  * updatedAt : DateTime
}

entity "UMKM" as umkm {
  * id : String <<PK>>
  --
  * name : String
  * location : String
  * category : String
  * grade : Grade
  * target : BigInt
  * current : BigInt
  * rbfRate : Float
  description : String
  imageUrl : String
  * ownerId : String <<FK>><<unique>>
  * createdAt : DateTime
  * updatedAt : DateTime
}

entity "Investment" as investment {
  * id : String <<PK>>
  --
  * amount : BigInt
  * userId : String <<FK>>
  * umkmId : String <<FK>>
  * xenditTxId : String <<unique>>
  merkleLeaf : String
  * status : InvestStatus
  * createdAt : DateTime
  * updatedAt : DateTime
}

entity "Tranche" as tranche {
  * id : String <<PK>>
  --
  * investId : String <<FK>>
  * stage : Int
  * amount : BigInt
  * aiVerified : Boolean
  confidence : Int
  receiptUrl : String
  releasedAt : DateTime
  * createdAt : DateTime
}

entity "Transaction" as transaction {
  * id : String <<PK>>
  --
  * xenditId : String <<unique>>
  * type : TxType
  * amount : BigInt
  polygonTxHash : String
  merkleRoot : String
  merkleLeaf : String
  * status : TxStatus
  investId : String <<FK>>
  rawPayload : Json
  * createdAt : DateTime
  * updatedAt : DateTime
}

user ||--o| umkm : "owner"
user ||--o{ investment : "investments"
umkm ||--o{ investment : "investments"
investment ||--o{ tranche : "tranches"
investment ||--o{ transaction : "transactions"

@enduml
```

---

## 2. Database Visualizer (DBML)

A direct, standards-compliant translation of the Prisma Schema configured for dbdiagram.io integration.

```dbml
Project NEMOS {
  database_type: 'PostgreSQL'
  Note: 'NEMOS Database Schema'
}

Enum Role {
  INVESTOR
  UMKM_OWNER
}

Enum Tier {
  FREE
  PREMIUM
}

Enum RiskProfile {
  KONSERVATIF
  MODERAT
  AGRESIF
}

Enum Grade {
  A
  B
  C
}

Enum InvestStatus {
  PENDING
  ACTIVE
  COMPLETED
  DEFAULTED
}

Enum TxType {
  INVESTMENT
  REPAYMENT
}

Enum TxStatus {
  PENDING
  BATCHING
  CONFIRMED
  FAILED
}

Table User {
  id varchar [primary key, default: `cuid()`]
  email varchar [unique, not null]
  password varchar [not null]
  name varchar [not null]
  role Role [not null]
  tier Tier [not null, default: 'FREE']
  riskProfile RiskProfile
  learningProgress int [not null, default: 0]
  createdAt timestamp [not null, default: `now()`]
  updatedAt timestamp [not null]
}

Table UMKM {
  id varchar [primary key, default: `cuid()`]
  name varchar [not null]
  location varchar [not null]
  category varchar [not null]
  grade Grade [not null]
  target bigint [not null]
  current bigint [not null, default: 0]
  rbfRate float [not null]
  description varchar
  imageUrl varchar
  ownerId varchar [unique, not null]
  createdAt timestamp [not null, default: `now()`]
  updatedAt timestamp [not null]
}

Table Investment {
  id varchar [primary key, default: `cuid()`]
  amount bigint [not null]
  userId varchar [not null]
  umkmId varchar [not null]
  xenditTxId varchar [unique, not null]
  merkleLeaf varchar
  status InvestStatus [not null, default: 'PENDING']
  createdAt timestamp [not null, default: `now()`]
  updatedAt timestamp [not null]
}

Table Tranche {
  id varchar [primary key, default: `cuid()`]
  investId varchar [not null]
  stage int [not null]
  amount bigint [not null]
  aiVerified boolean [not null, default: false]
  confidence int
  receiptUrl varchar
  releasedAt timestamp
  createdAt timestamp [not null, default: `now()`]
}

Table Transaction {
  id varchar [primary key, default: `cuid()`]
  xenditId varchar [unique, not null]
  type TxType [not null]
  amount bigint [not null]
  polygonTxHash varchar
  merkleRoot varchar
  merkleLeaf varchar
  status TxStatus [not null, default: 'PENDING']
  investId varchar
  rawPayload json
  createdAt timestamp [not null, default: `now()`]
  updatedAt timestamp [not null]
}

Ref: UMKM.ownerId - User.id
Ref: Investment.userId > User.id
Ref: Investment.umkmId > UMKM.id
Ref: Tranche.investId > Investment.id
Ref: Transaction.investId > Investment.id
```

---

## 3. System Architecture / Component Diagram

An overview of high-level microservices and integrations across the NEMOS ecosystem.

```plantuml
@startuml
!define RECTANGLE component
skinparam componentStyle rectangle

actor "User" as user

rectangle "Frontend (React/Vite)" as FE #e3f2fd
rectangle "Backend API\n(Express/Node.js)" as BE #e8f5e9
database "PostgreSQL\n(Neon)" as DB #fff3e0
queue "Redis Queue\n(BullMQ)" as Redis #ffebee
rectangle "AI Microservice\n(Python/FastAPI)" as AI #f3e5f5

cloud "External / Third Party APIs" {
  rectangle "Xendit Payment\nGateway" as Xendit
  rectangle "NVIDIA NIM\n(Mistral LLM)" as Nvidia
}

collections "Blockchain\n(Polygon Amoy)" as Blockchain #ede7f6

user --> FE : Interacts
FE <--> BE : REST / HTTP
BE <--> DB : Prisma ORM
BE --> Redis : Enqueues async jobs
Redis "Worker processes" --> BE : Consumes queue
BE <--> AI : API via HTTP (OCR & Verification)
AI <--> Nvidia : LLM prompts and inference
BE <--> Xendit : Generates QRIS & Receives Webhooks
BE <--> Blockchain : Smart Contract / Merkle Tree (via ethers.js)

@enduml
```

---

## 4. User Flowcharts (Investasi & AI OCR)

Visual mapping of the critical core loops for Investment matching and AI-based receipt reconciliations.

```plantuml
@startuml
skinparam conditionStyle diamond
skinparam arrowColor #333333

title User Flow: Investment & AI OCR Verification

package "Alur 1: Investasi" {
  start
  :User Login;
  :Cek Investment Gate;
  :Hit API Invest;
  :Generate Xendit QRIS;
  note right: System waits for user payment
  :Webhook Success (from Xendit);
  :Update DB\n(Invest & Tx Status);
  :Trigger Merkle Worker\n(Queue to BullMQ);
  stop
}

package "Alur 2: AI OCR" {
  start
  :UMKM Upload Struk\n(Proof of payment);
  :API Backend\nreceives file;
  :Send Base64 payload\nto AI Service (FastAPI);
  :AI Service calls\nNVIDIA NIM (Mistral);
  :Kembalikan JSON Result\n(Structured Data);
  :Backend simpan hasil\nrekonsiliasi ke DB;
  stop
}
@enduml
```

This completes the audit of the architecture as it stands for presentation and documentation readiness.
