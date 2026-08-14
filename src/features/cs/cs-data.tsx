import React from "react";
import { NumberBaseConverter, SortVisualizer, BinarySearchViz, VonNeumannViz } from "./interactive";

// A block of example content: prose, a code listing, a small table, or an
// embedded interactive widget.
export type CSBlock =
  | { kind: "text"; text: string }
  | { kind: "code"; lang?: string; code: string }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "widget"; render: React.ComponentType };

export interface CSExample {
  title: string;
  blocks: CSBlock[];
  // Optional alternative approach, revealed on demand.
  alternative?: { label: string; blocks: CSBlock[]; note?: string };
}

export interface CSKeyTerm {
  term: string;
  /** Exam-ready definition, phrased the way Cambridge mark schemes award it. */
  def: string;
  /** The words an examiner is scanning for — include these verbatim. */
  keywords?: string[];
}

export interface CSTopic {
  id: string;
  name: string;
  /**
   * The Cambridge 9618 syllabus section this topic is. Sections 1–12 are AS
   * (Papers 1–2); 13–20 are A Level (Papers 3–4). Shown on the card so the
   * index maps one-to-one onto the syllabus contents page.
   */
  section: number;
  order: number;
  summary: string;
  // Interactive tool for this topic, if any.
  component?: React.ComponentType;
  detail: string[]; // key points (RichText: **bold**, `code`, inline $maths$)
  /** Cambridge-style definitions to learn word-for-word. */
  keyTerms?: CSKeyTerm[];
  examples: CSExample[];
}

export const CS_TOPICS: CSTopic[] = [
  {
    id: "cs-01-information-representation",
    name: "Information Representation",
    section: 1,
    order: 1,
    summary: "Binary, hexadecimal, two's complement and character sets.",
    component: NumberBaseConverter,
    detail: [
      "Computers store everything in **binary** (base 2). An 8-bit **byte** holds values 0–255 (unsigned).",
      "**Hexadecimal** (base 16) is a compact shorthand — each hex digit maps to exactly 4 bits (a nibble).",
      "**Two's complement** represents signed integers: the most significant bit has a **negative** place value (−128 in 8 bits).",
      "Text uses a character set: **ASCII** (7-bit) or **Unicode** (variable, covers every script).",
    ],
    keyTerms: [
      { term: "Bit / Byte / Nibble", def: "A **bit** is a single binary digit (0 or 1); a **nibble** is 4 bits; a **byte** is **8 bits**.", keywords: ["binary digit", "8 bits"] },
      { term: "Why hexadecimal is used", def: "It is a **more compact, human-readable** way of writing binary — each hex digit represents exactly **4 bits** — making it **less error-prone** to read and write.", keywords: ["compact", "easier for humans to read", "one hex digit = 4 bits", "fewer errors"] },
      { term: "Two's complement", def: "A method of representing **signed integers** in which the **most significant bit has a negative place value** (−128 in 8 bits), allowing subtraction to be performed by addition.", keywords: ["signed integers", "most significant bit is negative", "subtraction by addition"] },
      { term: "Overflow", def: "Occurs when the result of a calculation is **too large to be stored in the available number of bits**, so a carry is lost and the answer is incorrect.", keywords: ["too large to store", "available number of bits", "carry out of the MSB"] },
      { term: "Character set", def: "An agreed **set of characters and the binary codes** used to represent them, so that different systems interpret text identically.", keywords: ["agreed set", "binary code for each character"] },
      { term: "ASCII vs Unicode", def: "**ASCII** uses 7 bits (128 characters), enough for English only. **Unicode** uses more bits so it can represent **all the world's writing systems**, at the cost of **larger file sizes**.", keywords: ["7 bits", "128 characters", "all languages", "larger file size"] },
    ],
    examples: [
      {
        title: "Convert denary 210 to binary",
        blocks: [
          { kind: "text", text: "Subtract the largest place values that fit:" },
          { kind: "code", lang: "working", code: `128  64  32  16   8   4   2   1
  1   1   0   1   0   0   1   0

128 + 64 + 16 + 2 = 210  →  11010010` },
        ],
        alternative: {
          label: "Alternative: as hexadecimal",
          note: "Group the 8 bits into two nibbles and convert each.",
          blocks: [{ kind: "code", lang: "working", code: `1101 0010
 D    2      →   210 = 0xD2` }],
        },
      },
      {
        title: "Two's complement of −46 (8-bit)",
        blocks: [
          { kind: "code", lang: "working", code: `+46         = 0010 1110
invert bits = 1101 0001
add 1       = 1101 0010   →  −46` },
          { kind: "text", text: "Notice `11010010` is **210** unsigned but **−46** signed — try it in the converter above." },
        ],
      },
      {
        title: "Binary addition & overflow",
        blocks: [
          { kind: "text", text: "Add column by column, carrying 1s just like denary:" },
          { kind: "code", lang: "working", code: `  0110 1101   (109)
+ 0101 0011   ( 83)
-----------
  1011 0000   (176)   ✓ fits in 8 bits` },
          { kind: "text", text: "But if a carry leaves the last bit, the result is too big to store — **overflow**:" },
          { kind: "code", lang: "working", code: `  1111 1111   (255)
+ 0000 0001   (  1)
-----------
1 0000 0000   carry out of bit 8 → OVERFLOW` },
        ],
        alternative: {
          label: "Alternative: logical shifts = ×/÷ by 2",
          note: "A cheap way to multiply or divide by powers of two.",
          blocks: [{ kind: "code", lang: "working", code: `0011 0100 (52)  << 1  = 0110 1000 (104)   ×2
0011 0100 (52)  >> 2  = 0000 1101 ( 13)   ÷4` }],
        },
      },
    ],
  },
  {
    id: "cs-02-communication",
    name: "Communication",
    section: 2,
    order: 2,
    summary: "Transmission methods, protocols and error checking.",
    detail: [
      "Data can be sent **serial/parallel** and **simplex/half-duplex/full-duplex**.",
      "**Packet switching** splits data into packets routed independently and reassembled at the destination.",
      "Error detection adds redundancy so corruption is spotted: **parity**, **checksum**, **check digit**, **ARQ**.",
      "Protocols (e.g. TCP/IP) are agreed rules that let different devices communicate.",
    ],
    keyTerms: [
      { term: "Protocol", def: "A **set of agreed rules** governing how data is transmitted between devices, so that different systems can communicate successfully.", keywords: ["set of rules", "agreed", "communication between devices"] },
      { term: "Serial vs parallel transmission", def: "**Serial** sends bits **one after another down a single wire** (reliable over long distances). **Parallel** sends **several bits simultaneously down multiple wires** (faster but suffers **skew** and **crosstalk** over distance).", keywords: ["one bit at a time", "several bits simultaneously", "skew", "crosstalk"] },
      { term: "Simplex / half-duplex / full-duplex", def: "**Simplex** = one direction only; **half-duplex** = both directions but **not at the same time**; **full-duplex** = both directions **simultaneously**.", keywords: ["one direction", "not at the same time", "simultaneously"] },
      { term: "Packet", def: "A **small unit of data** with a **header** (source and destination address, sequence number) and a **payload**, routed independently across a network.", keywords: ["header", "payload", "sequence number", "routed independently"] },
      { term: "Packet switching", def: "Data is **split into packets** that travel **independently by any available route** and are **reassembled in order** at the destination using their sequence numbers.", keywords: ["split into packets", "independent routes", "reassembled", "sequence numbers"] },
      { term: "Parity check", def: "An **error-detection** method in which a **parity bit** is added so the total number of 1s is odd or even as agreed; if the count is wrong on arrival, an error is detected.", keywords: ["error detection", "parity bit", "number of 1s", "odd/even"] },
      { term: "Checksum", def: "An error-detection method where a **calculated value derived from the data** is sent with it; the receiver **recalculates and compares** — a mismatch means corruption.", keywords: ["calculated from the data", "recalculated and compared"] },
      { term: "Limitation of parity", def: "It **cannot detect an even number of bit errors** (e.g. two flipped bits), and it **cannot identify which bit** is wrong or correct it.", keywords: ["two errors cancel out", "cannot locate the error"] },
      { term: "Checksum vs check digit", def: "A **check digit** is appended to a **number** (e.g. a barcode or ISBN) to validate it at **input**; a **checksum** validates a **block of transmitted data**.", keywords: ["check digit validates input", "checksum validates transmission"] },
    ],
    examples: [
      {
        title: "Even parity check",
        blocks: [
          { kind: "text", text: "With **even parity** the parity bit is set so the total number of 1s is even." },
          { kind: "code", lang: "working", code: `data    1 0 1 1 0 0 1   (four 1s — already even)
parity  0                 → sent as 0 1011001

If a bit flips in transit, the count of 1s
becomes odd → error detected.` },
        ],
        alternative: {
          label: "Alternative: checksum",
          note: "Parity misses two-bit errors; a checksum is stronger.",
          blocks: [
            { kind: "text", text: "Sum the data bytes, send the total alongside; the receiver re-adds and compares." },
            { kind: "code", lang: "working", code: `bytes:    45 + 210 + 17 = 272
checksum: 272 MOD 256 = 16   (sent with the data)

Receiver recomputes; a mismatch means corruption.` },
          ],
        },
      },
      {
        title: "Packet switching",
        blocks: [
          { kind: "text", text: "A message is broken into **packets**, each carrying a header:" },
          { kind: "table", headers: ["Header field", "Purpose"], rows: [
            ["Source address", "where the packet came from"],
            ["Destination address", "where it's going"],
            ["Sequence number", "how to reassemble in order"],
            ["Payload", "the actual chunk of data"],
          ] },
          { kind: "text", text: "Packets travel **independently** — routers pick the best route for each, so a busy or broken link is simply avoided." },
        ],
        alternative: {
          label: "Alternative: circuit switching",
          note: "The older telephone-network approach.",
          blocks: [
            { kind: "text", text: "A single **dedicated path** is reserved for the whole conversation. Reliable and in-order, but wasteful — the line is tied up even during silences, and one broken link drops the call." },
          ],
        },
      },
    ],
  },
  {
    id: "cs-04-processor-fundamentals",
    name: "Processor Fundamentals",
    section: 4,
    order: 4,
    summary: "Von Neumann architecture and the fetch–decode–execute cycle.",
    component: VonNeumannViz,
    detail: [
      "The **Von Neumann** model stores program instructions and data in the **same** memory.",
      "Key registers: **PC** (program counter), **MAR**, **MDR**, **CIR**, **ACC**.",
      "The **buses** — address, data and control — carry information between components.",
      "Clock speed, cores, cache and word length all affect performance.",
    ],
    keyTerms: [
      { term: "Von Neumann architecture", def: "A stored-program computer in which **program instructions and data are held in the same memory** and are fetched over the **same bus**, one instruction at a time.", keywords: ["stored program", "same memory", "instructions and data"] },
      { term: "Program Counter (PC)", def: "Holds the **address of the next instruction** to be fetched from memory.", keywords: ["address of the next instruction"] },
      { term: "Memory Address Register (MAR)", def: "Holds the **address of the memory location** currently being read from or written to.", keywords: ["address currently being accessed"] },
      { term: "Memory Data Register (MDR)", def: "Holds the **data or instruction just fetched from**, or about to be written to, memory.", keywords: ["data just fetched from memory"] },
      { term: "Current Instruction Register (CIR)", def: "Holds the **instruction currently being decoded and executed**, split into **opcode** and **operand**.", keywords: ["instruction being decoded", "opcode", "operand"] },
      { term: "Accumulator (ACC)", def: "A register that **stores the result of calculations** carried out by the ALU.", keywords: ["stores results of calculations", "ALU"] },
      { term: "Address bus", def: "Carries the **memory address** from the processor to memory. It is **unidirectional**; its **width determines the maximum addressable memory**.", keywords: ["unidirectional", "width determines addressable memory"] },
      { term: "Data bus", def: "Carries **data and instructions** between the processor, memory and I/O. It is **bidirectional**; its width affects **how many bits move per transfer**.", keywords: ["bidirectional", "carries data"] },
      { term: "Control bus", def: "Carries **control and timing signals** (e.g. read/write, clock, interrupt request) to coordinate components.", keywords: ["control signals", "timing", "read/write"] },
      { term: "Effect of clock speed", def: "A higher clock speed means **more fetch–decode–execute cycles per second**, so more instructions are processed — but heat and diminishing returns limit it.", keywords: ["more cycles per second", "more instructions"] },
      { term: "Cache memory", def: "**Small, very fast memory** between the CPU and RAM holding **frequently used instructions and data**, reducing the time spent waiting for main memory.", keywords: ["small fast memory", "frequently used data", "reduces access time"] },
    ],
    examples: [
      {
        title: "What each register does",
        blocks: [
          { kind: "table", headers: ["Register", "Role"], rows: [
            ["PC", "Holds the address of the next instruction"],
            ["MAR", "Holds the address currently being read/written"],
            ["MDR", "Holds the data/instruction just fetched from memory"],
            ["CIR", "Holds the current instruction being decoded"],
            ["ACC", "Holds the working result of calculations"],
          ] },
          { kind: "text", text: "Step through the animation above to watch data move `MAR → MDR → CIR` and the PC increment." },
        ],
        alternative: {
          label: "Alternative: the three buses",
          note: "How the components are actually wired together.",
          blocks: [
            { kind: "table", headers: ["Bus", "Carries", "Direction"], rows: [
              ["Address", "Which memory location", "One-way (CPU → memory)"],
              ["Data", "The value itself", "Two-way"],
              ["Control", "Timing/command signals (read/write)", "Two-way"],
            ] },
            { kind: "text", text: "A wider **address bus** means more addressable memory; a wider **data bus** means more bits moved per cycle." },
          ],
        },
      },
      {
        title: "The fetch–decode–execute cycle (in code)",
        blocks: [
          { kind: "code", lang: "register transfer", code: `FETCH
  PC → MAR
  memory[MAR] → MDR
  MDR → CIR
  PC ← PC + 1
DECODE
  CIR split into opcode + operand
EXECUTE
  carry out the opcode (e.g. ADD, using the ACC)` },
        ],
        alternative: {
          label: "Alternative: Harvard architecture",
          note: "Used in many microcontrollers/DSPs.",
          blocks: [
            { kind: "text", text: "**Harvard** keeps instructions and data in **separate** memories with separate buses, so an instruction and its data can be fetched **simultaneously** — faster, but less flexible than Von Neumann." },
          ],
        },
      },
    ],
  },
  {
    id: "cs-05-system-software",
    name: "System Software",
    section: 5,
    order: 5,
    summary: "Operating systems, translators and interrupts.",
    detail: [
      "The **operating system** manages memory, processes, files, devices and security — hiding hardware complexity.",
      "**Compiler**: translates the whole program once into machine code. **Interpreter**: translates and runs line by line.",
      "An **assembler** turns assembly language into machine code.",
      "An **interrupt** is a signal that makes the processor pause and service a higher-priority task.",
    ],
    keyTerms: [
      { term: "Operating system", def: "System software that **manages the hardware and provides an interface** between the user/applications and the computer, handling memory, processes, files, devices and security.", keywords: ["manages hardware", "interface between user and hardware", "manages resources"] },
      { term: "Compiler", def: "A translator that converts **the whole source program into object code in one go**, producing an **executable** that can be run repeatedly without the source.", keywords: ["whole program at once", "object code", "executable"] },
      { term: "Interpreter", def: "A translator that converts and executes source code **one statement at a time**, **stopping at the first error** — so it is slower to run but better for development.", keywords: ["one statement at a time", "stops at first error", "no executable produced"] },
      { term: "Assembler", def: "A translator that converts **assembly language into machine code**, generally **one mnemonic to one machine instruction**.", keywords: ["assembly language to machine code", "one-to-one"] },
      { term: "Interrupt", def: "A **signal sent to the processor** from hardware or software requesting **attention**, causing the CPU to **suspend the current program** and run an **interrupt service routine**.", keywords: ["signal to the processor", "suspend current program", "interrupt service routine"] },
      { term: "Why registers are saved on the stack", def: "So that the **exact state of the interrupted program is preserved** and can be **restored** to resume execution correctly afterwards.", keywords: ["preserve the state", "restore", "resume correctly"] },
      { term: "Utility software", def: "Programs that perform **housekeeping/maintenance tasks** on the system — e.g. **compression, defragmentation, backup, anti-virus, formatting**.", keywords: ["maintenance tasks", "compression", "backup", "defragmentation"] },
    ],
    examples: [
      {
        title: "Compiler vs interpreter",
        blocks: [
          { kind: "table", headers: ["", "Compiler", "Interpreter"], rows: [
            ["Translates", "Whole program at once", "One statement at a time"],
            ["Output", "Standalone executable", "No separate object file"],
            ["Speed to run", "Fast", "Slower (re-translates)"],
            ["Error reporting", "All at the end", "Stops at first error"],
            ["Best for", "Distributing finished software", "Development & testing"],
          ] },
        ],
        alternative: {
          label: "Alternative view: servicing an interrupt",
          blocks: [
            { kind: "code", lang: "steps", code: `1. Device raises an interrupt signal
2. CPU finishes the current instruction
3. Contents of registers saved (onto the stack)
4. Interrupt Service Routine runs
5. Registers restored; original program resumes` },
          ],
        },
      },
      {
        title: "Assembly language & the assembler",
        blocks: [
          { kind: "text", text: "Assembly uses **mnemonics** — one line per machine instruction. An assembler translates it 1-to-1 into machine code:" },
          { kind: "code", lang: "assembly", code: `LDD 100    // load value at address 100 into ACC
ADD 101    // add value at address 101 to ACC
STO 102    // store ACC into address 102` },
        ],
        alternative: {
          label: "Alternative: high-level vs low-level",
          note: "Why we mostly write in high-level languages.",
          blocks: [
            { kind: "table", headers: ["", "Low-level (assembly)", "High-level"], rows: [
              ["Portability", "Tied to one CPU", "Runs anywhere (recompiled)"],
              ["Readability", "Hard", "Close to English"],
              ["Control", "Total, register-level", "Abstracted away"],
              ["Use", "Drivers, embedded", "Most applications"],
            ] },
          ],
        },
      },
    ],
  },
  {
    id: "cs-06-security-integrity",
    name: "Security, Privacy & Data Integrity",
    section: 6,
    order: 6,
    summary: "Encryption, threats and protecting data.",
    detail: [
      "**Encryption** scrambles data so only the holder of the key can read it — protecting **confidentiality**.",
      "**Symmetric**: one shared secret key. **Asymmetric**: a public/private key pair.",
      "Threats include **malware**, **phishing**, **brute-force** and **SQL injection**; defences include firewalls, 2FA and validation.",
      "Ethics/privacy: data-protection principles, consent and responsible use.",
    ],
    keyTerms: [
      { term: "Encryption", def: "The process of **scrambling plaintext into ciphertext using a key**, so that it is **meaningless to anyone who intercepts it** without the key. It does **not prevent** interception — it makes the data **unreadable**.", keywords: ["plaintext", "ciphertext", "key", "meaningless if intercepted"] },
      { term: "Symmetric encryption", def: "Uses **the same key to encrypt and decrypt**. It is fast, but the key must be **transmitted securely** to the recipient — the key-distribution problem.", keywords: ["same key", "key distribution problem"] },
      { term: "Asymmetric encryption", def: "Uses a **key pair**: a **public key to encrypt** (freely shared) and a **matching private key to decrypt** (kept secret), removing the need to exchange a secret key.", keywords: ["public key", "private key", "key pair"] },
      { term: "Digital signature", def: "A **hash of the message encrypted with the sender's private key**, used to verify the sender's **authenticity** and that the message has **not been altered** (integrity).", keywords: ["encrypted with the private key", "authenticity", "integrity"] },
      { term: "Malware", def: "Malicious software designed to damage or gain unauthorised access — including **virus, worm, trojan, spyware and ransomware**.", keywords: ["virus", "worm", "trojan", "spyware", "ransomware"] },
      { term: "Phishing", def: "Sending **fraudulent messages appearing to be from a legitimate source** to trick a user into revealing **personal or financial data**.", keywords: ["appears legitimate", "trick the user", "personal data"] },
      { term: "SQL injection", def: "Entering **SQL statements into an input field** so they are **executed by the database**, allowing an attacker to bypass authentication or read/alter data.", keywords: ["SQL entered into an input box", "executed by the database"] },
      { term: "Firewall", def: "Hardware or software that **monitors and filters traffic** entering and leaving a network **against a set of rules**, blocking unauthorised access.", keywords: ["monitors traffic", "set of criteria/rules", "blocks unauthorised access"] },
      { term: "Validation vs verification", def: "**Validation** checks data is **reasonable/sensible** (range, format, length, type, presence). **Verification** checks data has been **accurately copied/entered** (double entry, visual check).", keywords: ["reasonable and sensible", "accurately copied", "double entry"] },
    ],
    examples: [
      {
        title: "Symmetric encryption (Caesar shift)",
        blocks: [
          { kind: "text", text: "Shift each letter by a fixed key. Key = 3:" },
          { kind: "code", lang: "working", code: `plaintext:  H E L L O
shift +3:   K H O O R
ciphertext: KHOOR

Same key (−3) reverses it. Fast, but the key
must be shared secretly beforehand.` },
        ],
        alternative: {
          label: "Alternative: asymmetric (public key)",
          note: "Solves the key-sharing problem.",
          blocks: [
            { kind: "text", text: "The recipient publishes a **public key** to encrypt with; only their matching **private key** can decrypt. Nothing secret ever has to be exchanged first — the basis of HTTPS and digital signatures." },
          ],
        },
      },
      {
        title: "SQL injection & input validation",
        blocks: [
          { kind: "text", text: "A naive login builds SQL from raw input. Type `' OR '1'='1` as the password and:" },
          { kind: "code", lang: "sql", code: `SELECT * FROM User
WHERE Name = 'admin' AND Pass = '' OR '1'='1';
-- '1'='1' is always true → attacker logs in` },
        ],
        alternative: {
          label: "Alternative: parameterised queries",
          note: "The proper fix — never concatenate user input.",
          blocks: [
            { kind: "code", lang: "sql", code: `SELECT * FROM User
WHERE Name = ? AND Pass = ?;
-- inputs are bound as data, never run as SQL` },
            { kind: "text", text: "Combine with **validation** (length, type, format) and hashing of stored passwords." },
          ],
        },
      },
    ],
  },
  {
    id: "cs-08-databases",
    name: "Databases",
    section: 8,
    order: 8,
    summary: "Relational databases, normalisation and SQL queries.",
    detail: [
      "A **relational database** stores data in linked tables; a **primary key** uniquely identifies each row, a **foreign key** links to another table.",
      "**Normalisation** (1NF → 2NF → 3NF) removes redundancy and update anomalies.",
      "**DDL** defines structure (`CREATE TABLE`); **DML** manipulates data (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).",
    ],
    keyTerms: [
      { term: "Relational database", def: "A database storing data in **linked tables (relations)**, where relationships are created using **primary and foreign keys**, avoiding data duplication.", keywords: ["linked tables", "primary and foreign keys", "avoids duplication"] },
      { term: "Primary key", def: "An attribute (or set of attributes) that **uniquely identifies each record** in a table.", keywords: ["uniquely identifies each record"] },
      { term: "Foreign key", def: "An attribute in one table that **refers to the primary key of another table**, creating the link between them.", keywords: ["refers to the primary key of another table", "creates a relationship"] },
      { term: "Secondary key", def: "An attribute used to provide an **alternative index for searching/sorting** the table quickly.", keywords: ["alternative index", "faster searching"] },
      { term: "Referential integrity", def: "The rule that a **foreign key value must match an existing primary key** (or be null), so no record refers to something that doesn't exist.", keywords: ["foreign key must match an existing primary key"] },
      { term: "First Normal Form (1NF)", def: "A table is in 1NF if it contains **no repeating groups** — every attribute holds a **single atomic value**.", keywords: ["no repeating groups", "atomic values"] },
      { term: "Second Normal Form (2NF)", def: "In 1NF **and** every **non-key attribute is fully functionally dependent on the whole primary key** (removes partial dependencies).", keywords: ["1NF", "no partial dependency", "depends on the whole key"] },
      { term: "Third Normal Form (3NF)", def: "In 2NF **and** contains **no non-key dependencies** — no non-key attribute depends on another non-key attribute (no transitive dependency).", keywords: ["2NF", "no transitive dependency", "no non-key dependencies"] },
      { term: "DDL vs DML", def: "**DDL** (Data Definition Language) **defines the structure** — `CREATE TABLE`, `ALTER TABLE`. **DML** (Data Manipulation Language) **works with the data** — `SELECT`, `INSERT`, `UPDATE`, `DELETE`.", keywords: ["defines structure", "manipulates data"] },
      { term: "DBMS", def: "**Database Management System** — software that creates, maintains and controls access to the database, providing security, a query processor and a data dictionary.", keywords: ["creates and maintains the database", "controls access", "data dictionary"] },
    ],
    examples: [
      {
        title: "A SELECT query",
        blocks: [
          { kind: "text", text: "Find science books, alphabetically:" },
          { kind: "code", lang: "sql", code: `SELECT Title, Author
FROM Book
WHERE Genre = 'Science'
ORDER BY Title ASC;` },
        ],
        alternative: {
          label: "Alternative: joining two tables",
          note: "When the answer spans related tables.",
          blocks: [
            { kind: "text", text: "List members with an outstanding loan:" },
            { kind: "code", lang: "sql", code: `SELECT Member.Name, Loan.DueDate
FROM Member
INNER JOIN Loan
  ON Member.MemberID = Loan.MemberID
WHERE Loan.Returned = FALSE;` },
          ],
        },
      },
      {
        title: "Changing data (DML)",
        blocks: [
          { kind: "code", lang: "sql", code: `INSERT INTO Book (Title, Author, Genre)
VALUES ('Sapiens', 'Harari', 'History');

UPDATE Book SET Genre = 'Nonfiction'
WHERE Author = 'Harari';` },
        ],
        alternative: {
          label: "Alternative: summarising with GROUP BY",
          note: "Aggregate functions answer 'how many?' questions.",
          blocks: [
            { kind: "code", lang: "sql", code: `SELECT Genre, COUNT(*) AS Total
FROM Book
GROUP BY Genre
HAVING COUNT(*) > 5;` },
          ],
        },
      },
    ],
  },
  {
    id: "cs-09-algorithm-design",
    name: "Algorithm Design & Problem-Solving",
    section: 9,
    order: 9,
    summary: "Searching and sorting — and how to choose.",
    component: SortVisualizer,
    detail: [
      "An **algorithm** is a precise, finite sequence of steps solving a problem.",
      "**Linear search** checks each element in turn — works on any list, $O(n)$.",
      "**Binary search** repeatedly halves a **sorted** list — much faster, $O(\\log n)$.",
      "Efficiency is judged by how work grows with input size (**time complexity**).",
    ],
    keyTerms: [
      { term: "Algorithm", def: "A **finite sequence of precise, unambiguous steps** that solves a problem or performs a task, and always **terminates**.", keywords: ["finite", "precise/unambiguous steps", "solves a problem", "terminates"] },
      { term: "Linear search", def: "Compares the target with **each element in turn** from the start until a match is found or the list ends. Works on **unsorted** data; $O(n)$.", keywords: ["each element in turn", "unsorted list", "O(n)"] },
      { term: "Binary search", def: "Repeatedly examines the **middle element** of a **sorted** list and **discards the half** that cannot contain the target. $O(\\log n)$ — far faster on large lists.", keywords: ["middle element", "must be sorted", "discards half", "O(log n)"] },
      { term: "Bubble sort", def: "Repeatedly steps through the list **comparing adjacent elements and swapping** them if out of order, so the largest 'bubbles' to the end each pass. $O(n^2)$.", keywords: ["compares adjacent elements", "swaps", "passes", "O(n²)"] },
      { term: "Insertion sort", def: "Builds a sorted section by taking each element and **inserting it into its correct position** among those already sorted. Efficient on **nearly-sorted** data.", keywords: ["inserts into correct position", "nearly sorted"] },
      { term: "Time complexity (Big-O)", def: "A measure of **how the number of operations grows as the input size n grows**, ignoring constants — used to compare algorithm efficiency.", keywords: ["how run time grows with input size", "ignores constants"] },
      { term: "Optimisation of bubble sort", def: "Use a **flag/boolean** to record whether any swap occurred in a pass; if none did, the list is **already sorted** and the algorithm can stop early.", keywords: ["flag", "no swaps means sorted", "stop early"] },
    ],
    examples: [
      {
        title: "Linear search",
        blocks: [
          { kind: "code", lang: "pseudocode", code: `FUNCTION LinearSearch(List : ARRAY[1:N] OF INTEGER,
                     Target : INTEGER) RETURNS INTEGER
    FOR Index ← 1 TO N
        IF List[Index] = Target THEN
            RETURN Index          // found
        ENDIF
    NEXT Index
    RETURN -1                     // not found
ENDFUNCTION` },
        ],
        alternative: {
          label: "Alternative: binary search (sorted list)",
          note: "Faster — O(log n) — but the list must be sorted first. Step through it below.",
          blocks: [
            { kind: "code", lang: "pseudocode", code: `FUNCTION BinarySearch(List : ARRAY[1:N] OF INTEGER,
                     Target : INTEGER) RETURNS INTEGER
    Low ← 1
    High ← N
    WHILE Low <= High DO
        Mid ← (Low + High) DIV 2
        IF List[Mid] = Target THEN
            RETURN Mid
        ELSEIF List[Mid] < Target THEN
            Low ← Mid + 1
        ELSE
            High ← Mid - 1
        ENDIF
    ENDWHILE
    RETURN -1
ENDFUNCTION` },
            { kind: "widget", render: BinarySearchViz },
          ],
        },
      },
      {
        title: "Bubble sort",
        blocks: [
          { kind: "text", text: "Repeatedly compare neighbours, swapping if out of order (watch the visualiser above):" },
          { kind: "code", lang: "pseudocode", code: `FOR I ← 1 TO N - 1
    FOR J ← 1 TO N - I
        IF List[J] > List[J + 1] THEN
            Temp ← List[J]
            List[J] ← List[J + 1]
            List[J + 1] ← Temp
        ENDIF
    NEXT J
NEXT I` },
        ],
        alternative: {
          label: "Alternative: insertion sort",
          note: "Often faster on nearly-sorted data.",
          blocks: [
            { kind: "code", lang: "pseudocode", code: `FOR I ← 2 TO N
    Key ← List[I]
    J ← I - 1
    WHILE J >= 1 AND List[J] > Key DO
        List[J + 1] ← List[J]
        J ← J - 1
    ENDWHILE
    List[J + 1] ← Key
NEXT I` },
          ],
        },
      },
    ],
  },
  {
    id: "cs-10-data-types-structures",
    name: "Data Types & Structures",
    section: 10,
    order: 10,
    summary: "Stacks, queues and linked lists.",
    detail: [
      "A **stack** is **LIFO** (last in, first out) — think of a pile of plates. Operations: `push`, `pop`, `peek`.",
      "A **queue** is **FIFO** (first in, first out).",
      "A **linked list** chains nodes together, each holding data and a **pointer** to the next.",
      "Choice of structure depends on how you need to add and remove items.",
    ],
    keyTerms: [
      { term: "Stack", def: "A **LIFO (Last In, First Out)** data structure where items are **added (pushed) and removed (popped) from the same end**, tracked by a **top pointer**.", keywords: ["LIFO", "push", "pop", "top pointer", "same end"] },
      { term: "Queue", def: "A **FIFO (First In, First Out)** data structure where items are **added at the rear** and **removed from the front**, tracked by front and rear pointers.", keywords: ["FIFO", "added at the rear", "removed from the front"] },
      { term: "Linked list", def: "A dynamic structure of **nodes**, each holding **data and a pointer to the next node**; the list is accessed via a **start pointer** and ends where the pointer is **null**.", keywords: ["nodes", "pointer to the next node", "start pointer", "null"] },
      { term: "Overflow / underflow", def: "**Overflow** = trying to add to a **full** structure; **underflow** = trying to remove from an **empty** one. Both must be checked before the operation.", keywords: ["adding to a full stack", "removing from an empty stack"] },
      { term: "Uses of a stack", def: "Storing **return addresses and register contents** for subroutine calls and interrupts, evaluating expressions, and implementing **undo**.", keywords: ["return addresses", "subroutine calls", "interrupts", "undo"] },
      { term: "Array vs linked list", def: "An **array** allows fast **direct access by index** but has a **fixed size** and costly insertion. A **linked list** is **dynamic** and cheap to insert/delete, but must be **traversed sequentially**.", keywords: ["direct access by index", "fixed size", "dynamic", "traversed sequentially"] },
      { term: "Binary tree", def: "A hierarchical structure where each node has **at most two child nodes** (left and right); an ordered binary tree keeps **smaller values left, larger right** for fast searching.", keywords: ["at most two children", "left smaller, right larger", "root", "leaf"] },
    ],
    examples: [
      {
        title: "Stack push & pop (array implementation)",
        blocks: [
          { kind: "code", lang: "pseudocode", code: `// Stack[1:MAX]; Top points at the last item (0 = empty)
PROCEDURE Push(Item)
    IF Top < MAX THEN
        Top ← Top + 1
        Stack[Top] ← Item
    ELSE
        OUTPUT "Stack overflow"
    ENDIF
ENDPROCEDURE

FUNCTION Pop() RETURNS INTEGER
    IF Top = 0 THEN
        OUTPUT "Stack underflow"
        RETURN -1
    ENDIF
    Item ← Stack[Top]
    Top ← Top - 1
    RETURN Item
ENDFUNCTION` },
        ],
        alternative: {
          label: "Alternative: a queue (FIFO)",
          note: "Same array, but remove from the front instead of the top.",
          blocks: [
            { kind: "code", lang: "pseudocode", code: `PROCEDURE Enqueue(Item)
    Rear ← Rear + 1
    Queue[Rear] ← Item
ENDPROCEDURE

FUNCTION Dequeue() RETURNS INTEGER
    Item ← Queue[Front]
    Front ← Front + 1
    RETURN Item
ENDFUNCTION` },
          ],
        },
      },
      {
        title: "Traversing a linked list",
        blocks: [
          { kind: "text", text: "Follow the pointers from the start until you reach `NULL`:" },
          { kind: "code", lang: "pseudocode", code: `Current ← StartPointer
WHILE Current <> NULL DO
    OUTPUT Node[Current].Data
    Current ← Node[Current].Pointer
ENDWHILE` },
        ],
        alternative: {
          label: "Alternative: static (array of records)",
          note: "A linked list can be simulated in a fixed array.",
          blocks: [
            { kind: "text", text: "Each element is a record holding **Data** and the **index** of the next element; a `FreeList` tracks unused slots. No dynamic memory needed — useful in exam-style pseudocode." },
          ],
        },
      },
    ],
  },
  {
    id: "cs-11-programming",
    name: "Programming",
    section: 11,
    order: 11,
    summary: "Cambridge pseudocode conventions and control flow.",
    detail: [
      "**Conventions**: keywords in CAPITALS, `←` for assignment, **1-based** arrays, `DECLARE Name : TYPE`.",
      "The three control structures: **sequence**, **selection** (`IF`, `CASE`), **iteration** (`FOR`, `WHILE`, `REPEAT`).",
      "Use `FOR` for a known number of repeats; `WHILE`/`REPEAT` when it depends on a condition.",
      "String handling: `LENGTH`, `MID`, `LEFT`, `RIGHT`, `UCASE`.",
    ],
    keyTerms: [
      { term: "Procedure vs function", def: "A **procedure** carries out a task and **does not return a value**; a **function returns a single value** to the point at which it was called.", keywords: ["does not return a value", "returns a value"] },
      { term: "Parameter vs argument", def: "A **parameter** is the variable named **in the subroutine definition**; an **argument** is the actual **value passed in** when it is called.", keywords: ["in the definition", "value passed in when called"] },
      { term: "By value vs by reference", def: "**By value** passes a **copy** — changes do **not** affect the original. **By reference** passes the **address**, so changes **do** affect the original variable.", keywords: ["copy", "changes do not affect the original", "address", "changes affect the original"] },
      { term: "Local vs global variable", def: "A **local** variable exists **only inside the subroutine** where it is declared; a **global** variable is accessible **throughout the whole program**.", keywords: ["only within the subroutine", "throughout the program"] },
      { term: "Why local variables are preferred", def: "They **avoid unintended side effects**, allow the same name to be reused safely, and **free memory** when the subroutine ends — making code easier to maintain.", keywords: ["avoid side effects", "reusable", "easier to maintain"] },
      { term: "Count-controlled vs condition-controlled loop", def: "A **count-controlled** (`FOR`) loop repeats a **known number of times**; a **condition-controlled** (`WHILE`/`REPEAT`) loop repeats **until a condition is met**, an unknown number of times.", keywords: ["known number of times", "until a condition is met"] },
      { term: "WHILE vs REPEAT", def: "`WHILE` tests the condition **before** the loop body, so it may execute **zero** times. `REPEAT…UNTIL` tests **after**, so it always executes **at least once**.", keywords: ["tests before", "may run zero times", "tests after", "runs at least once"] },
      { term: "Totalling vs counting", def: "**Totalling** accumulates a **running sum** of values; **counting** increments by **one** each time an event occurs.", keywords: ["running total", "increments by one"] },
    ],
    examples: [
      {
        title: "Average of an array (FOR loop)",
        blocks: [
          { kind: "code", lang: "pseudocode", code: `Total ← 0
FOR Index ← 1 TO N
    Total ← Total + Numbers[Index]
NEXT Index
Average ← Total / N
OUTPUT "Average is ", Average` },
        ],
        alternative: {
          label: "Alternative: WHILE loop",
          note: "Same result; the counter is managed by hand.",
          blocks: [
            { kind: "code", lang: "pseudocode", code: `Total ← 0
Index ← 1
WHILE Index <= N DO
    Total ← Total + Numbers[Index]
    Index ← Index + 1
ENDWHILE
Average ← Total / N` },
          ],
        },
      },
      {
        title: "Selection: IF vs CASE",
        blocks: [
          { kind: "text", text: "Nested `IF` handles ranges:" },
          { kind: "code", lang: "pseudocode", code: `IF Score >= 70 THEN
    Grade ← "A"
ELSEIF Score >= 60 THEN
    Grade ← "B"
ELSE
    Grade ← "C"
ENDIF` },
        ],
        alternative: {
          label: "Alternative: CASE for discrete values",
          note: "Cleaner when matching exact values (e.g. a menu).",
          blocks: [
            { kind: "code", lang: "pseudocode", code: `CASE OF Menu
    1 : CALL NewGame()
    2 : CALL LoadGame()
    3 : CALL Quit()
    OTHERWISE OUTPUT "Invalid choice"
ENDCASE` },
          ],
        },
      },
    ],
  },
  {
    id: "cs-20-python",
    name: "Python for Paper 4",
    section: 20,
    order: 20.5,
    summary: "Turning Cambridge pseudocode into working Python — the exam's chosen language.",
    detail: [
      "Paper 4 is **practical**: you write and test real code. Python is the most common choice, so you must be fluent at converting **pseudocode → Python**.",
      "The biggest trap: pseudocode arrays are **1-based** (`Arr[1]`) but Python lists are **0-based** (`arr[0]`). Decide a convention and stay consistent.",
      "Python has **no `ENDIF`/`ENDWHILE`** — blocks are defined by **indentation** (4 spaces). Getting this wrong is the most common runtime error.",
      "Learn the exam staples cold: **file handling**, **string manipulation**, **1-D/2-D lists**, **functions with parameters**, **exception handling**, and **classes** (for the OOP questions).",
    ],
    keyTerms: [
      { term: "Indentation", def: "In Python, **indentation defines the block structure** (which statements belong to a loop, `if` or function) — it replaces the `ENDIF`/`ENDWHILE` keywords used in pseudocode.", keywords: ["indentation defines blocks", "replaces END keywords"] },
      { term: "List", def: "Python's built-in **mutable, ordered sequence**, used where pseudocode says **array** — but indexed from **0**.", keywords: ["mutable", "ordered", "zero-indexed"] },
      { term: "Dictionary", def: "A collection of **key–value pairs** giving fast lookup by key — Python's equivalent of a **record** or hash table.", keywords: ["key-value pairs", "fast lookup"] },
      { term: "Exception handling", def: "Using **`try` / `except`** to **catch runtime errors** (bad input, missing file) so the program **fails gracefully** rather than crashing.", keywords: ["try except", "catch runtime errors", "fails gracefully"] },
      { term: "Validation in Python", def: "Checking input is **reasonable** before use — typically a **`while` loop** that re-prompts until the value passes a **range, type, length or presence** check.", keywords: ["re-prompt until valid", "range check", "type check"] },
      { term: "Class and object", def: "A **class** is the template defining attributes and methods; an **object** is an **instance** of it. `__init__` is the **constructor**, and `self` refers to the current object.", keywords: ["template", "instance", "constructor", "self"] },
    ],
    examples: [
      {
        title: "Pseudocode → Python: the translation table",
        blocks: [
          { kind: "text", text: "Learn this mapping and most Paper 4 questions become mechanical:" },
          { kind: "table", headers: ["Cambridge pseudocode", "Python"], rows: [
            ["`Total ← 0`", "`total = 0`"],
            ["`FOR i ← 1 TO 10` … `NEXT i`", "`for i in range(1, 11):`"],
            ["`WHILE x < 10 DO` … `ENDWHILE`", "`while x < 10:`"],
            ["`REPEAT` … `UNTIL x > 5`", "`while True:` … `if x > 5: break`"],
            ["`IF a > b THEN` … `ELSE` … `ENDIF`", "`if a > b:` … `else:`"],
            ["`OUTPUT \"Hi\"`", "`print(\"Hi\")`"],
            ["`INPUT Name`", "`name = input()`"],
            ["`LENGTH(S)`", "`len(s)`"],
            ["`MID(S, 2, 3)`", "`s[1:4]`"],
            ["`UCASE(S)`", "`s.upper()`"],
            ["`DIV` / `MOD`", "`//` / `%`"],
            ["`PROCEDURE P()`", "`def p():`"],
            ["`FUNCTION F() RETURNS INTEGER`", "`def f():` … `return`"],
          ] },
        ],
        alternative: {
          label: "Watch out: the off-by-one trap",
          note: "The single most common Paper 4 error.",
          blocks: [
            { kind: "code", lang: "python", code: `# Pseudocode: FOR i ← 1 TO N   (inclusive of N)
# Python range STOPS BEFORE the second number:
for i in range(1, n + 1):     # ✓ correct — includes n
    print(i)

for i in range(1, n):         # ✗ wrong — misses the last item

# Arrays: pseudocode Arr[1] is the FIRST item,
# but Python arr[0] is the first item.
arr = [10, 20, 30]
print(arr[0])                 # 10  (pseudocode would say Arr[1])` },
          ],
        },
      },
      {
        title: "The exam staples: validation, functions and files",
        blocks: [
          { kind: "text", text: "**Input validation with a re-prompt loop** — asked for constantly:" },
          { kind: "code", lang: "python", code: `def get_valid_mark():
    """Keep asking until the user gives a mark from 0 to 100."""
    while True:
        try:
            mark = int(input("Enter mark (0-100): "))
            if 0 <= mark <= 100:
                return mark                  # valid — leave the loop
            print("Out of range, try again.")
        except ValueError:
            print("That is not a whole number.")` },
          { kind: "text", text: "**Reading and writing a text file** — the other guaranteed topic:" },
          { kind: "code", lang: "python", code: `# WRITE (creates or overwrites)
with open("scores.txt", "w") as f:
    for name, score in [("Ana", 72), ("Ben", 65)]:
        f.write(name + "," + str(score) + "\\n")

# READ back, line by line
total = 0
count = 0
with open("scores.txt", "r") as f:
    for line in f:
        parts = line.strip().split(",")       # ['Ana', '72']
        total += int(parts[1])
        count += 1

print("Average:", total / count)` },
        ],
        alternative: {
          label: "Alternative: appending and handling a missing file",
          note: "Use 'a' to add without erasing, and try/except so it never crashes.",
          blocks: [
            { kind: "code", lang: "python", code: `# APPEND — adds to the end, keeps existing data
with open("scores.txt", "a") as f:
    f.write("Cara,88\\n")

# Guard against the file not existing
try:
    with open("scores.txt", "r") as f:
        data = f.readlines()
except FileNotFoundError:
    print("No file yet — starting a new one.")
    data = []` },
          ],
        },
      },
      {
        title: "2-D lists (arrays) — rows and columns",
        blocks: [
          { kind: "text", text: "A 2-D array in pseudocode becomes a **list of lists**. Loop rows, then columns:" },
          { kind: "code", lang: "python", code: `# 3 students × 4 subjects
marks = [
    [65, 70, 58, 80],
    [90, 85, 77, 72],
    [55, 60, 61, 49],
]

for row in range(len(marks)):            # each student
    total = 0
    for col in range(len(marks[row])):   # each subject
        total += marks[row][col]
    average = total / len(marks[row])
    print("Student", row + 1, "average:", round(average, 1))` },
        ],
        alternative: {
          label: "Alternative: the Pythonic version",
          note: "Shorter, but make sure you can still write the explicit loops for the exam.",
          blocks: [
            { kind: "code", lang: "python", code: `for i, row in enumerate(marks, start=1):
    print("Student", i, "average:", round(sum(row) / len(row), 1))

# Column totals using zip
for j, subject in enumerate(zip(*marks), start=1):
    print("Subject", j, "total:", sum(subject))` },
          ],
        },
      },
      {
        title: "OOP in Python — classes for the Paper 4 questions",
        blocks: [
          { kind: "text", text: "Encapsulation uses a **leading underscore** by convention, with **getters and setters**:" },
          { kind: "code", lang: "python", code: `class Student:
    def __init__(self, name, mark):     # constructor
        self._name = name               # "private" by convention
        self._mark = mark

    def get_name(self):                 # getter
        return self._name

    def set_mark(self, mark):           # setter with validation
        if 0 <= mark <= 100:
            self._mark = mark

    def grade(self):
        if self._mark >= 70: return "A"
        elif self._mark >= 60: return "B"
        return "C"

s = Student("Ana", 72)
print(s.get_name(), s.grade())          # Ana A` },
        ],
        alternative: {
          label: "Alternative: inheritance and polymorphism",
          note: "The subclass reuses the parent and overrides a method.",
          blocks: [
            { kind: "code", lang: "python", code: `class Person:
    def __init__(self, name):
        self._name = name
    def describe(self):
        return "Person: " + self._name

class Teacher(Person):                  # inherits from Person
    def __init__(self, name, subject):
        super().__init__(name)          # call the parent constructor
        self._subject = subject
    def describe(self):                 # overrides (polymorphism)
        return "Teacher of " + self._subject

for p in [Person("Ana"), Teacher("Ben", "Physics")]:
    print(p.describe())                 # picks the right version` },
          ],
        },
      },
    ],
  },
  {
    id: "cs-12-software-development",
    name: "Software Development",
    section: 12,
    order: 12,
    summary: "Hand-tracing an algorithm to find its output.",
    detail: [
      "A **trace table** records the value of each variable after every step — proving what an algorithm does.",
      "Add a column per variable (and one for any `OUTPUT`).",
      "Work through the loop **one iteration at a time**; don't skip ahead.",
    ],
    keyTerms: [
      { term: "Trace table", def: "A table used to **record the value of each variable after every step** of an algorithm, in order to **test it** and determine its output — a form of **dry running**.", keywords: ["records variable values", "each step", "dry run", "test the algorithm"] },
      { term: "Dry run", def: "Working through an algorithm **by hand, without a computer**, to check its logic and find errors.", keywords: ["by hand", "without a computer", "check the logic"] },
      { term: "Normal / boundary / erroneous data", def: "**Normal** = typical accepted values; **boundary (extreme)** = values at the **limits** of the accepted range; **erroneous (abnormal)** = values that should be **rejected**.", keywords: ["typical values", "limits of the range", "should be rejected"] },
      { term: "Logic error vs syntax error", def: "A **syntax error** breaks the **rules of the language** and prevents translation. A **logic error** translates and runs but produces the **wrong output** — trace tables find these.", keywords: ["breaks the rules of the language", "runs but wrong output"] },
    ],
    examples: [
      {
        title: "Trace a summing loop",
        blocks: [
          { kind: "code", lang: "pseudocode", code: `X ← 5
Y ← 0
WHILE X > 0 DO
    Y ← Y + X
    X ← X - 1
ENDWHILE
OUTPUT Y` },
          { kind: "text", text: "Filling the table iteration by iteration:" },
          { kind: "table", headers: ["X", "Y", "X > 0?", "OUTPUT"], rows: [
            ["5", "0", "true", ""],
            ["4", "5", "true", ""],
            ["3", "9", "true", ""],
            ["2", "12", "true", ""],
            ["1", "14", "true", ""],
            ["0", "15", "false", "15"],
          ] },
          { kind: "text", text: "So the algorithm outputs **15** — the sum 5+4+3+2+1." },
        ],
      },
      {
        title: "Trace integer division (repeated subtraction)",
        blocks: [
          { kind: "code", lang: "pseudocode", code: `A ← 17
B ← 5
Q ← 0
WHILE A >= B DO
    A ← A - B
    Q ← Q + 1
ENDWHILE
OUTPUT Q, A` },
          { kind: "table", headers: ["A", "B", "Q", "A >= B?"], rows: [
            ["17", "5", "0", "true"],
            ["12", "5", "1", "true"],
            ["7", "5", "2", "true"],
            ["2", "5", "3", "false"],
          ] },
          { kind: "text", text: "Outputs **Q = 3, A = 2** — i.e. 17 ÷ 5 = 3 remainder 2." },
        ],
      },
    ],
  },
  {
    id: "cs-20-further-programming",
    name: "Further Programming",
    section: 20,
    order: 20,
    summary: "Classes, objects, encapsulation, inheritance and polymorphism.",
    detail: [
      "A **class** is a blueprint bundling **attributes** (data) and **methods** (behaviour); an **object** is an instance of it.",
      "**Encapsulation**: keep attributes `PRIVATE`, expose `PUBLIC` methods to control access.",
      "**Inheritance**: a subclass reuses and extends a superclass.",
      "**Polymorphism**: subclasses can override a method with their own version.",
    ],
    keyTerms: [
      { term: "Class", def: "A **template/blueprint** that defines the **attributes (data) and methods (behaviour)** shared by all objects of that type.", keywords: ["template", "blueprint", "attributes and methods"] },
      { term: "Object", def: "An **instance of a class**, created at run time, with its **own values** for the class's attributes.", keywords: ["instance of a class", "own attribute values"] },
      { term: "Encapsulation", def: "Bundling **attributes and the methods that operate on them** into one class, and keeping attributes **private** so they can only be changed through **public methods** — protecting data integrity.", keywords: ["private attributes", "public methods", "data integrity", "bundled together"] },
      { term: "Inheritance", def: "A **subclass (child) derives the attributes and methods of a superclass (parent)** and can add its own — promoting **code reuse**.", keywords: ["subclass derives from superclass", "code reuse", "inherits attributes and methods"] },
      { term: "Polymorphism", def: "The ability of **different classes to respond to the same method call in their own way**, usually by **overriding** an inherited method.", keywords: ["same method name", "behaves differently", "overriding"] },
      { term: "Constructor", def: "A special method that runs **automatically when an object is created**, used to **initialise its attributes**.", keywords: ["runs when the object is created", "initialises attributes"] },
      { term: "Getter and setter", def: "**Public methods** that **read (get)** and **change (set)** a private attribute, allowing **validation** before a value is stored.", keywords: ["public methods", "access private attributes", "allow validation"] },
      { term: "Composition ('has-a')", def: "A class **contains an object of another class** as an attribute — used where the relationship is **has-a** rather than the **is-a** of inheritance.", keywords: ["has-a", "contains an object", "rather than is-a"] },
    ],
    examples: [
      {
        title: "A class with encapsulated data",
        blocks: [
          { kind: "code", lang: "pseudocode", code: `CLASS Animal
    PRIVATE Name : STRING
    PRIVATE Legs : INTEGER

    PUBLIC PROCEDURE NEW(GivenName, GivenLegs)
        Name ← GivenName
        Legs ← GivenLegs
    ENDPROCEDURE

    PUBLIC FUNCTION Describe() RETURNS STRING
        RETURN Name & " has " & NUM_TO_STR(Legs) & " legs"
    ENDFUNCTION
ENDCLASS` },
        ],
        alternative: {
          label: "Alternative: extend it with inheritance",
          note: "Dog reuses Animal and adds its own behaviour.",
          blocks: [
            { kind: "code", lang: "pseudocode", code: `CLASS Dog INHERITS Animal
    PUBLIC PROCEDURE NEW(GivenName)
        SUPER.NEW(GivenName, 4)   // all dogs have 4 legs
    ENDPROCEDURE

    PUBLIC FUNCTION Speak() RETURNS STRING
        RETURN "Woof"
    ENDFUNCTION
ENDCLASS` },
          ],
        },
      },
      {
        title: "Polymorphism (method overriding)",
        blocks: [
          { kind: "text", text: "Each shape provides its own `Area()`; calling code doesn't care which subclass it has:" },
          { kind: "code", lang: "pseudocode", code: `CLASS Shape
    PUBLIC FUNCTION Area() RETURNS REAL
        RETURN 0
    ENDFUNCTION
ENDCLASS

CLASS Circle INHERITS Shape
    PRIVATE R : REAL
    PUBLIC FUNCTION Area() RETURNS REAL   // overrides
        RETURN 3.14159 * R * R
    ENDFUNCTION
ENDCLASS` },
        ],
        alternative: {
          label: "Alternative: composition over inheritance",
          note: "Sometimes 'has-a' models reality better than 'is-a'.",
          blocks: [
            { kind: "text", text: "Instead of a `Car` **inheriting** from `Engine`, give the `Car` an `Engine` **attribute** (it *has* an engine). Composition avoids fragile deep inheritance trees and is easier to change." },
          ],
        },
      },
    ],
  },
  {
    // 9.1 Computational thinking skills — the AS half of the topic. The A Level
    // material (recursion, advanced algorithms) is section 19, below.
    id: "cs-09-computational-thinking-skills",
    name: "Computational Thinking Skills",
    section: 9,
    order: 9.1,
    summary: "Decomposition, abstraction and pattern recognition.",
    detail: [
      "**Decomposition**: break a big problem into smaller, solvable sub-problems.",
      "**Abstraction**: strip away irrelevant detail, keeping only what matters.",
      "**Pattern recognition**: spot repetition you can reuse or turn into a loop/function.",
      "Together they turn a vague task into an implementable algorithm.",
    ],
    keyTerms: [
      { term: "Decomposition", def: "**Breaking a complex problem down into smaller sub-problems** that can each be solved more easily, and often independently.", keywords: ["breaking into smaller sub-problems", "easier to solve"] },
      { term: "Abstraction", def: "**Removing unnecessary detail** and keeping only the features **essential to solving the problem**, producing a simpler model.", keywords: ["removing unnecessary detail", "keeping essential features"] },
      { term: "Pattern recognition", def: "**Identifying similarities or repetition** within or between problems, so a solution can be **reused or generalised** (e.g. into a loop or subroutine).", keywords: ["identifying similarities", "repetition", "reuse the solution"] },
      { term: "Stepwise refinement", def: "**Top-down design**: repeatedly breaking each step into **finer sub-steps** until every step is simple enough to code directly.", keywords: ["top-down", "repeatedly break into sub-steps"] },
      { term: "Why decomposition helps", def: "Sub-problems can be **worked on by different people in parallel**, are **easier to test and debug** individually, and produce **reusable modules**.", keywords: ["worked on in parallel", "easier to test and debug", "reusable modules"] },
    ],
    examples: [
      {
        title: "Decomposing 'send an email'",
        blocks: [
          { kind: "code", lang: "decomposition", code: `Send an email
├─ Compose message
│   ├─ Enter recipient
│   ├─ Write subject
│   └─ Write body
├─ Validate recipient address
└─ Transmit
    ├─ Connect to mail server
    └─ Confirm delivery` },
        ],
        alternative: {
          label: "Alternative lens: abstraction",
          note: "The same task, detail removed.",
          blocks: [
            { kind: "text", text: "A user only needs **to**, **subject**, **body** and a **send** button. The TCP handshakes, DNS lookups and mail-server protocols are **abstracted away** behind that interface — present but hidden, so the user isn't overwhelmed." },
          ],
        },
      },
      {
        title: "Pattern recognition → a reusable subroutine",
        blocks: [
          { kind: "text", text: "Spotting the same steps repeated is a cue to generalise them into one parameterised routine:" },
          { kind: "code", lang: "pseudocode", code: `// repeated code...
Area1 ← Width1 * Height1
Area2 ← Width2 * Height2

// ...becomes one reusable function
FUNCTION RectArea(W, H) RETURNS INTEGER
    RETURN W * H
ENDFUNCTION` },
        ],
        alternative: {
          label: "Alternative: stepwise refinement",
          note: "Top-down design that meets decomposition in the middle.",
          blocks: [
            { kind: "text", text: "Start from one high-level statement (\"process the order\") and repeatedly break each step into finer sub-steps until every line is simple enough to code directly." },
          ],
        },
      },
    ],
  },
  // ================= Sections added to complete the syllabus =================
  {
    id: "cs-03-hardware",
    name: "Hardware",
    section: 3,
    order: 3,
    summary: "Components, storage, and logic gates and circuits.",
    detail: [
      "**Primary** storage is directly addressable by the CPU: **RAM** (volatile, holds running programs) and **ROM** (non-volatile, holds the bootstrap).",
      "**Secondary** storage is non-volatile and not directly addressable — magnetic (HDD), solid-state (SSD) and optical (CD/DVD).",
      "**Input** devices convert real-world data into a form the computer can process; **output** devices do the reverse.",
      "A **logic gate** performs a Boolean operation on its inputs. The six examined are `AND`, `OR`, `NOT`, `NAND`, `NOR` and `XOR`.",
      "A **logic circuit** combines gates; describe it with a **truth table** covering every input combination ($2^n$ rows for $n$ inputs).",
    ],
    keyTerms: [
      { term: "RAM vs ROM", def: "**RAM** is **volatile** read/write memory holding the programs and data currently in use; **ROM** is **non-volatile** and normally read-only, holding the start-up (bootstrap) instructions.", keywords: ["volatile", "non-volatile", "currently in use", "bootstrap"] },
      { term: "Primary vs secondary storage", def: "**Primary** storage is **directly accessed by the CPU**; **secondary** storage is **non-volatile, larger and slower**, used for long-term retention and not directly addressable.", keywords: ["directly accessed by the processor", "non-volatile", "long-term"] },
      { term: "Solid-state (SSD)", def: "Secondary storage using **NAND flash** with **no moving parts** — faster access, lower power and more shock-resistant than a hard disk, but with a finite number of write cycles.", keywords: ["no moving parts", "flash memory", "faster access", "limited write cycles"] },
      { term: "Truth table", def: "A table listing **every possible combination of inputs** and the resulting output of a logic gate or circuit — $2^n$ rows for $n$ inputs.", keywords: ["every combination of inputs", "resulting output", "2 to the power n rows"] },
      { term: "NAND / NOR as universal gates", def: "Any logic circuit can be built **entirely from NAND gates** (or entirely from NOR gates), which is why they are called **universal** — useful because one component type is cheaper to manufacture.", keywords: ["any circuit can be built from them", "universal gate"] },
      { term: "XOR", def: "Output is 1 when the inputs are **different** (exactly one input is 1) — distinct from OR, which is also 1 when both are 1.", keywords: ["inputs are different", "exactly one input is 1"] },
    ],
    examples: [
      {
        title: "Truth table for a two-gate circuit",
        blocks: [
          { kind: "text", text: "The circuit computes $X = (A \\text{ AND } B) \\text{ OR } (\\text{NOT } C)$. Work the intermediate columns out first, then combine them:" },
          { kind: "table", headers: ["A", "B", "C", "A AND B", "NOT C", "X"], rows: [
            ["0", "0", "0", "0", "1", "1"],
            ["0", "0", "1", "0", "0", "0"],
            ["0", "1", "1", "0", "0", "0"],
            ["1", "0", "1", "0", "0", "0"],
            ["1", "1", "0", "1", "1", "1"],
            ["1", "1", "1", "1", "0", "1"],
          ] },
          { kind: "text", text: "With three inputs there are $2^3 = 8$ rows in full — always write **every** combination, in binary counting order, or you lose marks for an incomplete table." },
        ],
        alternative: {
          label: "Alternative: build it from NAND only",
          note: "Why NAND is called a universal gate.",
          blocks: [
            { kind: "text", text: "Each basic gate can be made from NANDs alone, so a whole circuit needs only one component type:" },
            { kind: "table", headers: ["Gate", "Built from NAND"], rows: [
              ["NOT A", "A NAND A"],
              ["A AND B", "(A NAND B) NAND (A NAND B)"],
              ["A OR B", "(A NAND A) NAND (B NAND B)"],
            ] },
          ],
        },
      },
      {
        title: "Choosing storage for a task",
        blocks: [
          { kind: "table", headers: ["Requirement", "Choice", "Why"], rows: [
            ["Running programs now", "RAM", "Directly addressable and fast, but volatile"],
            ["Boot instructions", "ROM", "Must survive power-off and never change"],
            ["Laptop main drive", "SSD", "Fast, silent, shock-resistant; no moving parts"],
            ["Cheap bulk archive", "HDD", "Lowest cost per gigabyte"],
          ] },
        ],
      },
    ],
  },
  {
    id: "cs-07-ethics-ownership",
    name: "Ethics & Ownership",
    section: 7,
    order: 7,
    summary: "Professional conduct, copyright, licensing and the ethics of AI.",
    detail: [
      "Computing professionals are expected to follow a **code of conduct** — competence, honesty about limitations, respect for privacy, and no conflict of interest.",
      "**Copyright** protects the *expression* of an idea (the source code, the artwork), not the idea itself, and arises automatically.",
      "Software **licences** set what you may legally do: proprietary, **free and open source**, **freeware**, **shareware**.",
      "**Artificial intelligence** raises questions of bias, accountability and transparency that the law is still catching up with.",
    ],
    keyTerms: [
      { term: "Copyright", def: "The **legal right of the creator** to control the copying, distribution and adaptation of their work. It applies **automatically** on creation and protects the **expression**, not the underlying idea.", keywords: ["legal right of the creator", "copying and distribution", "automatic", "expression not the idea"] },
      { term: "Free and open source software (FOSS)", def: "Software distributed **with its source code**, which users may **run, study, modify and redistribute**. 'Free' refers to **freedom**, not price.", keywords: ["source code provided", "may modify and redistribute", "freedom not price"] },
      { term: "Freeware vs shareware", def: "**Freeware** is free to use indefinitely but the **source code is not supplied**. **Shareware** is free only for a **trial period or with limited features**, after which payment is required.", keywords: ["free to use", "no source code", "trial period", "limited features"] },
      { term: "Code of conduct", def: "A **set of professional standards** a computing professional agrees to follow — acting competently, respecting confidentiality and privacy, avoiding conflicts of interest, and being honest about their limitations.", keywords: ["professional standards", "competence", "confidentiality", "conflict of interest"] },
      { term: "Algorithmic bias", def: "Where an AI system produces **systematically unfair outcomes for a group** because that unfairness was present in its **training data** or in the choice of features.", keywords: ["systematically unfair", "training data", "reflects existing bias"] },
      { term: "Ethical issue vs legal issue", def: "A **legal** issue concerns what the **law permits or forbids**; an **ethical** issue concerns what is **morally right**. Something can be perfectly legal and still be unethical — a distinction examiners test directly.", keywords: ["what the law says", "what is morally right", "legal but unethical"] },
    ],
    examples: [
      {
        title: "Which licence fits the situation?",
        blocks: [
          { kind: "table", headers: ["Scenario", "Licence", "Reason"], rows: [
            ["A school wants to adapt a tool for its own use", "FOSS", "Source code supplied and modification permitted"],
            ["A firm wants to protect its commercial code", "Proprietary", "Source withheld, use restricted by the EULA"],
            ["A developer wants users to try before buying", "Shareware", "Time-limited or feature-limited trial"],
            ["A utility given away with no source", "Freeware", "Free to use, but cannot be studied or modified"],
          ] },
        ],
        alternative: {
          label: "Alternative: framing it as an ethics answer",
          note: "How to earn the evaluation marks rather than just listing.",
          blocks: [
            { kind: "text", text: "A strong answer names the **stakeholders** and the **conflict** between them. For a school copying licensed software: the school gains (cost saved), the developer loses (revenue and the incentive to keep developing), and pupils learn that infringement is normal. The conclusion should identify the **legal breach** *and* the **separate ethical harm** — that a professional should model lawful behaviour." },
          ],
        },
      },
      {
        title: "Accountability when an AI gets it wrong",
        blocks: [
          { kind: "text", text: "A recruitment model trained on a decade of a firm's own hiring data down-ranks applicants from certain universities. Work through it as an exam answer:" },
          { kind: "table", headers: ["Question", "Response"], rows: [
            ["What went wrong?", "The model learned historic bias present in the training data"],
            ["Was it illegal?", "Possibly — discrimination law may apply to the outcome, not the intent"],
            ["Was it unethical?", "Yes — foreseeable harm, and deploying without testing for bias breaches professional duty"],
            ["Who is accountable?", "The deploying organisation; 'the algorithm decided' is not a defence"],
            ["What would prevent it?", "Bias testing before release, explainability, human review of rejections"],
          ] },
        ],
      },
    ],
  },
  {
    id: "cs-13-data-representation",
    name: "Data Representation",
    section: 13,
    order: 13,
    summary: "User-defined types, file organisation and floating-point numbers.",
    detail: [
      "A **user-defined data type** is one the programmer builds from existing types — **non-composite** (enumerated, pointer) or **composite** (record, set, class).",
      "**File organisation** determines how records are stored: **serial**, **sequential**, **random (direct)**.",
      "**Access method** is separate from organisation: sequential access reads records in order; direct access jumps straight to one via a **hashing algorithm**.",
      "**Floating-point** representation splits a number into a **mantissa** and an **exponent**, both usually in two's complement.",
      "**Normalisation** maximises precision: a positive mantissa begins `0.1`, a negative one begins `1.0`.",
    ],
    keyTerms: [
      { term: "User-defined data type", def: "A data type **defined by the programmer** from existing types, so that variables can model the problem directly. **Non-composite** types (enumerated, pointer) are built from one existing type; **composite** types (record, set, class) combine several.", keywords: ["defined by the programmer", "from existing types", "non-composite", "composite"] },
      { term: "Enumerated type", def: "A **non-composite** user-defined type listing **all the values a variable may take**, in order, as named constants — e.g. `TYPE TDay = (Mon, Tue, Wed)`.", keywords: ["list of all possible values", "named constants", "ordered"] },
      { term: "Serial vs sequential file", def: "In a **serial** file records are stored in the order they arrived, with **no ordering key**. In a **sequential** file they are stored **in order of a key field**, which allows a much faster search.", keywords: ["order of arrival", "no key order", "ordered on a key field"] },
      { term: "Random (direct) file organisation", def: "Records are placed at an address calculated from the key by a **hashing algorithm**, so any record can be retrieved **directly in roughly one read** without searching.", keywords: ["hashing algorithm", "address calculated from the key", "direct access"] },
      { term: "Hashing collision", def: "Where two different keys **hash to the same address**. It is resolved by **open addressing** (store in the next free slot) or by **chaining** (an overflow list at that address).", keywords: ["two keys give the same address", "open addressing", "overflow area"] },
      { term: "Mantissa and exponent", def: "In floating-point form a value is $\\text{mantissa} \\times 2^{\\text{exponent}}$: the **mantissa** carries the significant digits (**precision**) and the **exponent** fixes the position of the binary point (**range**).", keywords: ["mantissa gives precision", "exponent gives range"] },
      { term: "Normalisation (floating point)", def: "Adjusting the mantissa and exponent so a **positive** number starts `0.1` and a **negative** number starts `1.0`. This gives the **greatest precision** for the bits available and one unique representation per value.", keywords: ["positive starts 0.1", "negative starts 1.0", "maximum precision", "unique representation"] },
      { term: "Precision vs range trade-off", def: "For a fixed total number of bits, **more mantissa bits give greater precision** but **fewer exponent bits reduce the range** of representable values — and vice versa.", keywords: ["more mantissa means more precision", "more exponent means greater range", "fixed number of bits"] },
    ],
    examples: [
      {
        title: "Normalising a floating-point number",
        blocks: [
          { kind: "text", text: "Shift the mantissa left until it begins `0.1`, decrementing the exponent by 1 for each shift:" },
          { kind: "code", lang: "working", code: `mantissa 0001 1000   exponent 0110  (+6)
shift <<1  0011 0000            0101  (+5)
shift <<1  0110 0000            0100  (+4)
shift <<1  1100 0000  -- stop, this is now negative!

Back up one: 0110 0000, exponent 0100
Normalised (starts 0.1) = 0.75 x 2^4 = 12` },
          { kind: "text", text: "Stop as soon as the mantissa reads `0.1…`. Shifting once more flips the sign bit and changes the number entirely." },
        ],
        alternative: {
          label: "Alternative: a negative mantissa",
          note: "The mirror rule — normalised negatives start 1.0.",
          blocks: [
            { kind: "code", lang: "working", code: `mantissa 1110 0000   exponent 0011  (+3)
shift <<1  1100 0000            0010  (+2)
Normalised (starts 1.0) = -0.5 x 2^2 = -2` },
          ],
        },
      },
      {
        title: "Picking a file organisation",
        blocks: [
          { kind: "table", headers: ["Requirement", "Organisation", "Access", "Why"], rows: [
            ["Log every transaction as it happens", "Serial", "Sequential", "Appending is fastest; order doesn't matter"],
            ["Monthly payroll over all staff", "Sequential", "Sequential", "Every record is processed, in key order"],
            ["Look up one customer instantly", "Random", "Direct", "Hash the key and read that address"],
          ] },
          { kind: "text", text: "Note the two columns are independent: a **sequential** file can also be accessed **directly** if an index exists." },
        ],
      },
    ],
  },
  {
    id: "cs-14-communication-internet",
    name: "Communication & Internet Technologies",
    section: 14,
    order: 14,
    summary: "Protocols, protocol stacks, and circuit versus packet switching.",
    detail: [
      "A **protocol** is a set of agreed rules; the internet uses a **stack** of them, each layer handling one concern and using the layer below.",
      "**TCP** guarantees reliable, in-order delivery; **IP** addresses and routes packets. They are usually paired as **TCP/IP**.",
      "**Circuit switching** reserves a dedicated path for the whole conversation; **packet switching** routes each packet independently.",
      "Application-layer protocols: **HTTP/HTTPS** (web), **FTP** (files), **SMTP/POP3/IMAP** (mail), **BitTorrent** (peer-to-peer).",
    ],
    keyTerms: [
      { term: "Protocol stack", def: "A set of protocols **arranged in layers**, each providing a service to the layer above and using the layer below, so that each layer can be **designed and changed independently**.", keywords: ["arranged in layers", "service to the layer above", "independent of other layers"] },
      { term: "TCP", def: "**Transmission Control Protocol** — splits data into packets, numbers them, checks for errors and **requests retransmission of anything lost**, guaranteeing **reliable, in-order** delivery.", keywords: ["splits into packets", "error checking", "retransmission", "reliable and in order"] },
      { term: "IP", def: "**Internet Protocol** — **addresses** each packet and **routes** it across networks towards its destination. It is 'best effort': it does not itself guarantee delivery.", keywords: ["addressing", "routing", "best effort", "no delivery guarantee"] },
      { term: "Circuit switching", def: "A **dedicated physical path is reserved** for the entire duration of a communication. Delivery is in order with constant delay, but the line is **wasted during silences** and a broken link ends the call.", keywords: ["dedicated path reserved", "for the whole duration", "wasteful", "fails if link breaks"] },
      { term: "Packet switching", def: "Data is **split into packets** that are **routed independently** by whichever route is best at the time, then **reassembled in sequence** at the destination. Efficient and resilient, but packets can arrive out of order or late.", keywords: ["split into packets", "routed independently", "reassembled using sequence numbers", "resilient"] },
      { term: "Peer-to-peer (BitTorrent)", def: "A distributed model where every machine is **both client and server**: a file is split into pieces held by many **peers** (a swarm), and a **tracker** tells a new peer where the pieces are. There is **no central server** to overload.", keywords: ["both client and server", "swarm", "tracker", "no central server"] },
    ],
    examples: [
      {
        title: "Circuit vs packet switching, side by side",
        blocks: [
          { kind: "table", headers: ["", "Circuit switching", "Packet switching"], rows: [
            ["Path", "One dedicated path, reserved up front", "Chosen per packet, can differ"],
            ["Set-up", "Connection established before sending", "None — just send"],
            ["Efficiency", "Poor — line idle during pauses", "Good — bandwidth shared"],
            ["Order", "Always in order", "May arrive out of order; resequenced"],
            ["Link failure", "Call drops", "Routed around it"],
            ["Best for", "Constant-rate voice calls", "Bursty data traffic"],
          ] },
        ],
        alternative: {
          label: "Alternative: what a packet actually carries",
          note: "The header fields examiners expect you to name.",
          blocks: [
            { kind: "table", headers: ["Field", "Purpose"], rows: [
              ["Source address", "Where the packet came from"],
              ["Destination address", "Where it is going"],
              ["Sequence number", "Position for reassembly"],
              ["Payload", "The chunk of data itself"],
              ["Time to live / hop count", "Discards the packet if it circulates too long"],
            ] },
          ],
        },
      },
      {
        title: "Which protocol does what",
        blocks: [
          { kind: "table", headers: ["Protocol", "Layer", "Job"], rows: [
            ["HTTP / HTTPS", "Application", "Request and transfer web pages (HTTPS adds TLS encryption)"],
            ["FTP", "Application", "Transfer files between hosts"],
            ["SMTP", "Application", "Send outgoing mail"],
            ["POP3 / IMAP", "Application", "Retrieve mail (POP3 downloads; IMAP keeps it on the server)"],
            ["TCP", "Transport", "Reliable, ordered delivery"],
            ["IP", "Network", "Addressing and routing"],
          ] },
        ],
      },
    ],
  },
  {
    id: "cs-15-hardware-virtual-machines",
    name: "Hardware & Virtual Machines",
    section: 15,
    order: 15,
    summary: "Parallel processing, virtual machines and Boolean algebra.",
    detail: [
      "**Flynn's taxonomy** classifies processors by instruction and data streams: **SISD**, **SIMD**, **MISD**, **MIMD**.",
      "A **virtual machine** is software emulating a complete computer, letting a guest OS run as a process on a host.",
      "**Boolean algebra** simplifies logic circuits; the key tools are the distributive law, **absorption**, and **De Morgan's laws**.",
      "A **Karnaugh map** is a visual alternative to algebraic simplification, grouping adjacent 1s in powers of two.",
    ],
    keyTerms: [
      { term: "Parallel processing", def: "Using **several processors or cores simultaneously** on parts of the same task, so it completes faster than a single processor could manage.", keywords: ["several processors simultaneously", "parts of the same task"] },
      { term: "SIMD", def: "**Single Instruction, Multiple Data** — one instruction is applied to **many data items at the same time** by an array of processors. Typical of GPUs and vector processing.", keywords: ["one instruction", "many data items simultaneously", "array processor"] },
      { term: "MIMD", def: "**Multiple Instruction, Multiple Data** — each processor runs **its own instruction stream on its own data**. Typical of multi-core CPUs and clusters.", keywords: ["different instructions", "different data", "multi-core"] },
      { term: "Virtual machine", def: "**Software that emulates a complete computer system**, providing a guest operating system with what appears to be its own dedicated hardware while actually running as a process on a host.", keywords: ["software emulating a computer", "guest operating system", "appears to be dedicated hardware"] },
      { term: "De Morgan's laws", def: "$\\overline{A.B} = \\overline{A} + \\overline{B}$ and $\\overline{A+B} = \\overline{A}.\\overline{B}$ — **break the bar and change the sign**. Used to eliminate a bar over a bracket.", keywords: ["break the line change the sign", "NOT (A AND B) = NOT A OR NOT B"] },
      { term: "Absorption law", def: "$A + A.B = A$ and $A.(A+B) = A$ — a term is **absorbed** when it already implies the other, letting you delete it outright.", keywords: ["A OR (A AND B) = A", "term is absorbed"] },
      { term: "Karnaugh map", def: "A grid in which adjacent cells differ by **one variable only** (Gray code order). Grouping adjacent 1s in blocks of $2^n$ yields a **minimal** Boolean expression without algebra.", keywords: ["adjacent cells differ by one variable", "Gray code", "group in powers of two", "minimal expression"] },
    ],
    examples: [
      {
        title: "Simplify with De Morgan's laws",
        blocks: [
          { kind: "code", lang: "working", code: `X = NOT(A . B) . NOT(A + C)

De Morgan on each bracket:
  NOT(A . B)  =  NOT A + NOT B
  NOT(A + C)  =  NOT A . NOT C

X = (NOT A + NOT B) . NOT A . NOT C

Absorption: (NOT A + NOT B) . NOT A  =  NOT A

X = NOT A . NOT C          (two gates instead of five)` },
          { kind: "text", text: "State the law you are using at each step — Cambridge awards a mark for the method as well as the answer." },
        ],
        alternative: {
          label: "Alternative: a Karnaugh map",
          note: "Same answer, no algebra.",
          blocks: [
            { kind: "text", text: "Plot the outputs, then group adjacent 1s in blocks of 1, 2, 4 or 8. Columns are in **Gray code** order (00, 01, 11, 10) so neighbouring cells differ by one variable:" },
            { kind: "table", headers: ["A\\BC", "00", "01", "11", "10"], rows: [
              ["0", "1", "0", "0", "1"],
              ["1", "0", "0", "0", "0"],
            ] },
            { kind: "text", text: "The two 1s sit in row $A=0$ where $C=0$, so the group reads $\\overline{A}.\\overline{C}$ — identical to the algebra above." },
          ],
        },
      },
      {
        title: "Flynn's taxonomy in practice",
        blocks: [
          { kind: "table", headers: ["Class", "Instructions", "Data", "Real example"], rows: [
            ["SISD", "One", "One", "A classic single-core Von Neumann processor"],
            ["SIMD", "One", "Many", "A GPU shading thousands of pixels at once"],
            ["MISD", "Many", "One", "Rare — redundant flight-control systems cross-checking"],
            ["MIMD", "Many", "Many", "A multi-core CPU or a server cluster"],
          ] },
        ],
      },
    ],
  },
  {
    id: "cs-16-system-software",
    name: "System Software",
    section: 16,
    order: 16,
    summary: "What an operating system really does, and how translators work.",
    detail: [
      "An OS provides **memory management**, **process (CPU) scheduling**, **file management**, **device management** and **security**.",
      "**Paging** divides memory into fixed-size pages; **segmentation** uses variable-size logical segments.",
      "**Virtual memory** lets a program larger than RAM run by paging sections to disk — over-doing it causes **disk thrashing**.",
      "An **interrupt** is a signal that suspends the current process so a higher-priority one can be serviced.",
      "Translators: an **assembler** for assembly language, a **compiler** for whole-program translation, an **interpreter** for line-by-line execution.",
    ],
    keyTerms: [
      { term: "Memory management", def: "The OS function that **allocates memory to processes, keeps a record of what is in use**, and **protects each process's memory** so one program cannot overwrite another's.", keywords: ["allocates memory", "keeps track of what is in use", "protects processes from each other"] },
      { term: "Paging", def: "Dividing physical memory into **fixed-size pages** and program memory into pages of the same size, so any page can be loaded into any frame — removing the need for contiguous free space.", keywords: ["fixed-size blocks", "any page into any frame", "no need for contiguous memory"] },
      { term: "Segmentation", def: "Dividing a program into **variable-length logical segments** that reflect its structure (a procedure, an array), rather than into equal-sized blocks.", keywords: ["variable length", "logical divisions of the program"] },
      { term: "Virtual memory", def: "Using **secondary storage as an extension of RAM**: pages not currently needed are **swapped out to disk**, allowing programs larger than physical memory to run.", keywords: ["secondary storage as extra RAM", "pages swapped to disk", "programs larger than memory"] },
      { term: "Disk thrashing", def: "Where the system spends **more time swapping pages in and out than executing**, because too many processes are competing for too little real memory — throughput collapses.", keywords: ["more time swapping than processing", "excessive paging"] },
      { term: "Interrupt", def: "A **signal to the processor from hardware or software** requesting attention. At the end of the current fetch–decode–execute cycle the processor **saves its state**, runs the **interrupt service routine**, then restores the state and resumes.", keywords: ["signal requesting attention", "end of the current cycle", "saves state", "interrupt service routine"] },
      { term: "Scheduling", def: "Deciding **which process gets the processor and for how long**, to maximise throughput and keep the system responsive. Methods include round robin, first come first served, shortest job first and priority scheduling.", keywords: ["which process gets the CPU", "for how long", "round robin", "priority"] },
      { term: "Assembler vs compiler vs interpreter", def: "An **assembler** translates **assembly language** to machine code (roughly one-to-one). A **compiler** translates the **whole** high-level program before execution. An **interpreter** translates and executes **one statement at a time**.", keywords: ["one to one", "whole program before execution", "statement at a time"] },
    ],
    examples: [
      {
        title: "How an interrupt is handled",
        blocks: [
          { kind: "code", lang: "sequence", code: `1  Device raises an interrupt signal on the control bus
2  Processor finishes the CURRENT fetch-decode-execute cycle
3  Contents of registers (PC, ACC, ...) pushed onto the stack
4  Interrupt's priority checked against the running process
5  If higher: address of the ISR loaded into the PC
6  Interrupt Service Routine executes
7  Registers popped back off the stack
8  Interrupted process resumes exactly where it left off` },
          { kind: "text", text: "Step 2 matters: the current **cycle** is completed first, not the current program. Saying 'the processor stops immediately' loses the mark." },
        ],
        alternative: {
          label: "Alternative: why a stack is used",
          note: "It handles nested interrupts for free.",
          blocks: [
            { kind: "text", text: "If a higher-priority interrupt arrives while an ISR is running, its state is pushed on top. Because a stack is **last in, first out**, each routine resumes in exactly the reverse order — no bookkeeping needed." },
          ],
        },
      },
      {
        title: "Round robin scheduling traced",
        blocks: [
          { kind: "text", text: "Three processes, each needing 6 ms of CPU, with a **time slice** of 2 ms:" },
          { kind: "code", lang: "working", code: `time  0-2   2-4   4-6   6-8   8-10  10-12 12-14 14-16 16-18
proc   P1    P2    P3    P1    P2    P3    P1    P2    P3
                                                        all done at 18ms` },
          { kind: "text", text: "Every process gets the CPU regularly, so none starves and the system stays responsive. The cost is **context switching** — saving and restoring state at each swap is pure overhead." },
        ],
      },
    ],
  },
  {
    id: "cs-17-security",
    name: "Security",
    section: 17,
    order: 17,
    summary: "Symmetric and asymmetric encryption, digital signatures and certificates.",
    detail: [
      "**Symmetric** encryption uses **one shared key** for both encryption and decryption — fast, but the key must be exchanged securely.",
      "**Asymmetric** encryption uses a **public/private key pair**; what one key encrypts, only the other can decrypt.",
      "A **digital signature** is a **hash of the message encrypted with the sender's private key** — it proves authorship and detects tampering.",
      "A **digital certificate** binds a public key to an identity and is signed by a **Certificate Authority**.",
      "**SSL/TLS** uses asymmetric encryption to agree a symmetric **session key**, then switches to symmetric for speed.",
    ],
    keyTerms: [
      { term: "Symmetric encryption", def: "Encryption using a **single shared secret key** for both encryption and decryption. It is **fast**, but the key itself must somehow be **distributed securely** — the key-exchange problem.", keywords: ["same key for both", "fast", "key distribution problem"] },
      { term: "Asymmetric encryption", def: "Encryption using a **matched key pair**: a **public key** anyone may hold and a **private key** kept secret. Data encrypted with one can **only** be decrypted with the other, so no secret needs to be exchanged.", keywords: ["public and private key pair", "only the other key can decrypt", "no shared secret needed"] },
      { term: "Digital signature", def: "A **hash (digest) of the message, encrypted with the sender's private key**. The recipient decrypts it with the sender's public key and compares with their own hash — proving **authenticity** and that the message is **unaltered**.", keywords: ["hash of the message", "encrypted with the private key", "authenticity", "not been altered"] },
      { term: "Digital certificate", def: "An electronic document containing the owner's **public key and identifying details**, **signed by a Certificate Authority**, which allows a recipient to trust that the public key genuinely belongs to that owner.", keywords: ["contains the public key", "identity details", "signed by a Certificate Authority"] },
      { term: "Certificate Authority (CA)", def: "A **trusted third party** that verifies an applicant's identity and **signs their certificate with its own private key**. Browsers ship with the CAs' public keys pre-installed, which is where the chain of trust begins.", keywords: ["trusted third party", "verifies identity", "signs with its own private key"] },
      { term: "Hashing vs encryption", def: "**Encryption is reversible** with the correct key; **hashing is one-way** — the digest cannot be turned back into the original. Hashing checks integrity and stores passwords; encryption keeps data confidential.", keywords: ["encryption is two-way", "hashing is one-way", "cannot be reversed"] },
      { term: "SSL/TLS handshake", def: "The client and server use **asymmetric** encryption to authenticate and agree a shared **session key**, then switch to **symmetric** encryption for the rest of the session — combining asymmetric's safe key exchange with symmetric's speed.", keywords: ["asymmetric to agree a session key", "then symmetric", "best of both"] },
    ],
    examples: [
      {
        title: "Sending a signed, confidential message",
        blocks: [
          { kind: "text", text: "Alice wants Bob to know the message is **from her** and that **nobody else can read it**. Two key pairs, used in opposite directions:" },
          { kind: "code", lang: "sequence", code: `SIGNING (proves it is from Alice)
  Alice hashes the message              -> digest
  Alice encrypts the digest with HER PRIVATE key -> signature

CONFIDENTIALITY (only Bob can read it)
  Alice encrypts the message with BOB'S PUBLIC key

AT BOB'S END
  Decrypt message with HIS PRIVATE key
  Decrypt signature with ALICE'S PUBLIC key -> digest A
  Hash the received message                 -> digest B
  digest A = digest B  ->  authentic AND unaltered` },
          { kind: "text", text: "The rule to memorise: **encrypt with the recipient's public key for secrecy; encrypt with your own private key for proof of identity.**" },
        ],
        alternative: {
          label: "Alternative: why not use asymmetric for everything?",
          note: "The reason TLS bothers with a session key.",
          blocks: [
            { kind: "text", text: "Asymmetric encryption is **far slower** — the maths is much heavier — so encrypting a whole video stream with it would be impractical. TLS therefore uses asymmetric encryption **only** to agree a symmetric session key safely, then uses fast symmetric encryption for the bulk of the data." },
          ],
        },
      },
      {
        title: "What a certificate actually contains",
        blocks: [
          { kind: "table", headers: ["Field", "Purpose"], rows: [
            ["Subject", "Who the certificate belongs to (the domain name)"],
            ["Public key", "The subject's public key"],
            ["Issuer", "Which Certificate Authority signed it"],
            ["Valid from / to", "The period it may be trusted"],
            ["Serial number", "Unique identifier, used for revocation"],
            ["CA's digital signature", "The CA's guarantee, verifiable with the CA's public key"],
          ] },
          { kind: "text", text: "The browser verifies the signature with the CA's public key it already holds. That is what stops an attacker substituting their own public key for the server's." },
        ],
      },
    ],
  },
  {
    id: "cs-18-artificial-intelligence",
    name: "Artificial Intelligence",
    section: 18,
    order: 18,
    summary: "Machine learning, deep learning, neural networks and graph search.",
    detail: [
      "**Artificial intelligence** is the simulation of human intelligence by machines — reasoning, learning and self-correction.",
      "**Machine learning** improves at a task from data rather than from explicit programming; **deep learning** is ML using multi-layer neural networks.",
      "Learning types: **supervised** (labelled data), **unsupervised** (finds structure itself), **reinforcement** (learns from reward and penalty).",
      "An **artificial neural network** has an input layer, one or more **hidden layers** and an output layer, with **weighted** connections adjusted during training.",
      "Graph-search algorithms **A\\*** and **Dijkstra's** underpin pathfinding; A\\* adds a **heuristic** estimate of the remaining distance.",
    ],
    keyTerms: [
      { term: "Machine learning", def: "A branch of AI in which a system **improves its performance at a task by learning from data**, rather than being explicitly programmed with the rules.", keywords: ["improves from data", "not explicitly programmed"] },
      { term: "Deep learning", def: "Machine learning using **artificial neural networks with many hidden layers**, which learn the useful **features from raw data themselves** instead of having them hand-engineered.", keywords: ["many hidden layers", "learns features from raw data"] },
      { term: "Supervised learning", def: "Training on a **labelled dataset** — each input is paired with its correct output — so the model learns the mapping and can then predict labels for unseen data.", keywords: ["labelled data", "input paired with correct output", "predicts unseen data"] },
      { term: "Unsupervised learning", def: "Training on **unlabelled data**, where the system finds **structure or patterns for itself** — most commonly by **clustering** similar items.", keywords: ["unlabelled data", "finds patterns itself", "clustering"] },
      { term: "Reinforcement learning", def: "Learning by **interacting with an environment** and receiving a **reward or penalty** for each action, so behaviour that maximises cumulative reward is reinforced.", keywords: ["reward and penalty", "trial and error", "maximise reward"] },
      { term: "Hidden layer", def: "A layer of nodes **between the input and output layers** of a neural network. Each node applies **weights** and an activation function; adjusting those weights during training is how the network learns.", keywords: ["between input and output", "weights", "adjusted during training"] },
      { term: "Back propagation", def: "The training method where the **error at the output is propagated backwards** through the network so each **weight is adjusted** in the direction that reduces the error.", keywords: ["error propagated backwards", "weights adjusted", "reduce the error"] },
      { term: "Heuristic (A\\*)", def: "An **estimate of the remaining cost** from a node to the goal. A\\* selects the node with the lowest $f = g + h$, where $g$ is the cost so far and $h$ the heuristic — so it explores towards the goal instead of in all directions.", keywords: ["estimate of the remaining cost", "f = g + h", "cost so far plus estimate"] },
    ],
    examples: [
      {
        title: "A* versus Dijkstra",
        blocks: [
          { kind: "table", headers: ["", "Dijkstra's", "A*"], rows: [
            ["Chooses next node by", "Lowest cost so far, g", "Lowest g + h"],
            ["Uses a heuristic?", "No", "Yes — estimated distance to goal"],
            ["Search shape", "Expands in all directions", "Biased towards the goal"],
            ["Nodes examined", "More", "Fewer, if h is good"],
            ["Guarantees shortest path?", "Yes", "Yes, provided h never overestimates"],
          ] },
          { kind: "text", text: "The condition on the last row matters: a heuristic that never overestimates is **admissible**. Straight-line distance works for maps because it can never exceed the real road distance." },
        ],
        alternative: {
          label: "Alternative: the three learning types compared",
          note: "Match the type to the data you actually have.",
          blocks: [
            { kind: "table", headers: ["Type", "Data given", "Typical use"], rows: [
              ["Supervised", "Inputs with correct labels", "Spam detection, image classification"],
              ["Unsupervised", "Inputs only, no labels", "Customer segmentation, anomaly detection"],
              ["Reinforcement", "No data — an environment and rewards", "Game playing, robot control"],
            ] },
          ],
        },
      },
      {
        title: "How a neural network learns",
        blocks: [
          { kind: "code", lang: "sequence", code: `1  Inputs presented at the input layer
2  Each connection multiplies its value by a WEIGHT
3  Hidden-layer nodes sum their inputs, apply an
   activation function, pass the result on
4  Output layer produces a prediction
5  Prediction compared with the known correct label -> ERROR
6  BACK PROPAGATION: error sent backwards, each weight
   nudged in the direction that reduces it
7  Repeat over many passes (epochs) until error is small
8  Test on data the network has NEVER seen` },
          { kind: "text", text: "Step 8 is the one candidates forget. Testing on the training data proves nothing — it only shows the network has memorised, not generalised." },
        ],
      },
    ],
  },
  {
    id: "cs-19-computational-thinking",
    name: "Computational Thinking & Problem Solving",
    section: 19,
    order: 19,
    summary: "Recursion, and the algorithms examined at A Level.",
    detail: [
      "A **recursive** routine calls itself. It needs a **base case** that stops the recursion and a **general case** that moves towards it.",
      "Each unfinished call puts a **stack frame** — return address, parameters, local variables — on the **call stack**; too many causes a **stack overflow**.",
      "Any recursive solution can be rewritten **iteratively**, usually with an explicit stack, and iteration is generally faster and lighter on memory.",
      "A **binary tree** is naturally recursive: traverse it **in-order** to get sorted output, **pre-order** to copy it, **post-order** to delete it.",
      "Sorting at A Level: **insertion** and **bubble** are $O(n^2)$; **quicksort** and **merge sort** are $O(n \\log n)$.",
    ],
    keyTerms: [
      { term: "Recursion", def: "A routine **defined in terms of itself**, which calls itself with a **smaller version of the problem** until a **base case** is reached.", keywords: ["defined in terms of itself", "calls itself", "smaller problem", "base case"] },
      { term: "Base case", def: "The condition under which a recursive routine **returns without calling itself again**. Without one the recursion never stops and the stack overflows.", keywords: ["stops the recursion", "returns without recursing", "prevents infinite recursion"] },
      { term: "Stack frame", def: "The block pushed onto the **call stack** for each active call, holding the **return address, parameters and local variables** so the call can resume correctly when the one below it returns.", keywords: ["return address", "parameters", "local variables", "call stack"] },
      { term: "Stack overflow", def: "The error raised when recursion goes **too deep for the memory allocated to the call stack** — usually caused by a missing or unreachable base case.", keywords: ["too deep", "call stack runs out of memory", "missing base case"] },
      { term: "In-order traversal", def: "Visit the **left subtree, then the node, then the right subtree**. On a binary search tree this outputs the data in **ascending order**.", keywords: ["left, node, right", "produces sorted order"] },
      { term: "Time complexity (Big O)", def: "How the number of operations **grows with the size of the input, n**, ignoring constants: $O(1)$ constant, $O(\\log n)$ logarithmic, $O(n)$ linear, $O(n \\log n)$, $O(n^2)$ quadratic.", keywords: ["how running time grows with n", "ignores constants", "worst case"] },
    ],
    examples: [
      {
        title: "Recursive vs iterative factorial",
        blocks: [
          { kind: "text", text: "The recursive version reads almost like the mathematical definition:" },
          { kind: "code", lang: "pseudocode", code: `FUNCTION Fact(n : INTEGER) RETURNS INTEGER
    IF n <= 1 THEN          // base case
        RETURN 1
    ELSE                     // general case
        RETURN n * Fact(n - 1)
    ENDIF
ENDFUNCTION` },
          { kind: "text", text: "Trace `Fact(4)` and you can see the stack build up, then unwind:" },
          { kind: "code", lang: "trace", code: `Fact(4) -> 4 * Fact(3)          <- 4 frames on the stack
           4 * (3 * Fact(2))
           4 * (3 * (2 * Fact(1)))
           4 * (3 * (2 * 1))        <- base case reached
           = 24                      <- unwinds back up` },
        ],
        alternative: {
          label: "Alternative: the iterative version",
          note: "Same answer, one stack frame instead of n.",
          blocks: [
            { kind: "code", lang: "pseudocode", code: `FUNCTION Fact(n : INTEGER) RETURNS INTEGER
    DECLARE Result : INTEGER
    Result <- 1
    FOR i <- 2 TO n
        Result <- Result * i
    NEXT i
    RETURN Result
ENDFUNCTION` },
            { kind: "text", text: "Iteration uses **constant** memory and avoids the call overhead, so it is faster and cannot overflow the stack. Recursion wins on readability where the problem is itself recursive — tree traversal, for instance, is far uglier iteratively." },
          ],
        },
      },
      {
        title: "Traversing a binary tree",
        blocks: [
          { kind: "text", text: "For this binary search tree:" },
          { kind: "code", lang: "tree", code: `          20
         /    \\
       10      30
      /  \\       \\
     5    15      40` },
          { kind: "table", headers: ["Traversal", "Order of visits", "Result", "Used for"], rows: [
            ["In-order", "left, node, right", "5 10 15 20 30 40", "Reading a BST in sorted order"],
            ["Pre-order", "node, left, right", "20 10 5 15 30 40", "Copying or serialising the tree"],
            ["Post-order", "left, right, node", "5 15 10 40 30 20", "Deleting the tree safely"],
          ] },
          { kind: "code", lang: "pseudocode", code: `PROCEDURE InOrder(Node)
    IF Node <> NULL THEN
        CALL InOrder(Node.Left)
        OUTPUT Node.Data
        CALL InOrder(Node.Right)
    ENDIF
ENDPROCEDURE` },
          { kind: "text", text: "The base case here is `Node = NULL` — an empty subtree needs no work, which is what stops the recursion at the leaves." },
        ],
      },
    ],
  },
];

export function csTopicById(id: string): CSTopic | undefined {
  return CS_TOPICS.find((t) => t.id === id);
}

/** Topics in syllabus order, 1 → 20. */
export const CS_TOPICS_ORDERED = [...CS_TOPICS].sort((a, b) => a.order - b.order);
