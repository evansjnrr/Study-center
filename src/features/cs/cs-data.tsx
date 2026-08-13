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

export interface CSTopic {
  id: string;
  name: string;
  order: number;
  summary: string;
  // Interactive tool for this topic, if any.
  component?: React.ComponentType;
  detail: string[]; // key points (RichText: **bold**, `code`, inline $maths$)
  examples: CSExample[];
}

export const CS_TOPICS: CSTopic[] = [
  {
    id: "cs-data-representation",
    name: "Data Representation",
    order: 1,
    summary: "Binary, hexadecimal, two's complement and character sets.",
    component: NumberBaseConverter,
    detail: [
      "Computers store everything in **binary** (base 2). An 8-bit **byte** holds values 0–255 (unsigned).",
      "**Hexadecimal** (base 16) is a compact shorthand — each hex digit maps to exactly 4 bits (a nibble).",
      "**Two's complement** represents signed integers: the most significant bit has a **negative** place value (−128 in 8 bits).",
      "Text uses a character set: **ASCII** (7-bit) or **Unicode** (variable, covers every script).",
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
    id: "cs-communication",
    name: "Communication & Networking",
    order: 2,
    summary: "Transmission methods, protocols and error checking.",
    detail: [
      "Data can be sent **serial/parallel** and **simplex/half-duplex/full-duplex**.",
      "**Packet switching** splits data into packets routed independently and reassembled at the destination.",
      "Error detection adds redundancy so corruption is spotted: **parity**, **checksum**, **check digit**, **ARQ**.",
      "Protocols (e.g. TCP/IP) are agreed rules that let different devices communicate.",
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
    id: "cs-hardware",
    name: "Hardware & the Processor",
    order: 3,
    summary: "Von Neumann architecture and the fetch–decode–execute cycle.",
    component: VonNeumannViz,
    detail: [
      "The **Von Neumann** model stores program instructions and data in the **same** memory.",
      "Key registers: **PC** (program counter), **MAR**, **MDR**, **CIR**, **ACC**.",
      "The **buses** — address, data and control — carry information between components.",
      "Clock speed, cores, cache and word length all affect performance.",
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
    id: "cs-software",
    name: "System Software",
    order: 4,
    summary: "Operating systems, translators and interrupts.",
    detail: [
      "The **operating system** manages memory, processes, files, devices and security — hiding hardware complexity.",
      "**Compiler**: translates the whole program once into machine code. **Interpreter**: translates and runs line by line.",
      "An **assembler** turns assembly language into machine code.",
      "An **interrupt** is a signal that makes the processor pause and service a higher-priority task.",
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
    id: "cs-security-ethics",
    name: "Security, Privacy & Ethics",
    order: 5,
    summary: "Encryption, threats and protecting data.",
    detail: [
      "**Encryption** scrambles data so only the holder of the key can read it — protecting **confidentiality**.",
      "**Symmetric**: one shared secret key. **Asymmetric**: a public/private key pair.",
      "Threats include **malware**, **phishing**, **brute-force** and **SQL injection**; defences include firewalls, 2FA and validation.",
      "Ethics/privacy: data-protection principles, consent and responsible use.",
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
    id: "cs-databases",
    name: "Databases & SQL",
    order: 6,
    summary: "Relational databases, normalisation and SQL queries.",
    detail: [
      "A **relational database** stores data in linked tables; a **primary key** uniquely identifies each row, a **foreign key** links to another table.",
      "**Normalisation** (1NF → 2NF → 3NF) removes redundancy and update anomalies.",
      "**DDL** defines structure (`CREATE TABLE`); **DML** manipulates data (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).",
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
    id: "cs-algorithm-design",
    name: "Algorithm Design & Problem-Solving",
    order: 7,
    summary: "Searching and sorting — and how to choose.",
    component: SortVisualizer,
    detail: [
      "An **algorithm** is a precise, finite sequence of steps solving a problem.",
      "**Linear search** checks each element in turn — works on any list, $O(n)$.",
      "**Binary search** repeatedly halves a **sorted** list — much faster, $O(\\log n)$.",
      "Efficiency is judged by how work grows with input size (**time complexity**).",
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
    id: "cs-data-structures",
    name: "Data Structures",
    order: 8,
    summary: "Stacks, queues and linked lists.",
    detail: [
      "A **stack** is **LIFO** (last in, first out) — think of a pile of plates. Operations: `push`, `pop`, `peek`.",
      "A **queue** is **FIFO** (first in, first out).",
      "A **linked list** chains nodes together, each holding data and a **pointer** to the next.",
      "Choice of structure depends on how you need to add and remove items.",
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
    id: "cs-pseudocode",
    name: "Pseudocode & Programming",
    order: 9,
    summary: "Cambridge pseudocode conventions and control flow.",
    detail: [
      "**Conventions**: keywords in CAPITALS, `←` for assignment, **1-based** arrays, `DECLARE Name : TYPE`.",
      "The three control structures: **sequence**, **selection** (`IF`, `CASE`), **iteration** (`FOR`, `WHILE`, `REPEAT`).",
      "Use `FOR` for a known number of repeats; `WHILE`/`REPEAT` when it depends on a condition.",
      "String handling: `LENGTH`, `MID`, `LEFT`, `RIGHT`, `UCASE`.",
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
    id: "cs-trace-tables",
    name: "Trace Tables",
    order: 10,
    summary: "Hand-tracing an algorithm to find its output.",
    detail: [
      "A **trace table** records the value of each variable after every step — proving what an algorithm does.",
      "Add a column per variable (and one for any `OUTPUT`).",
      "Work through the loop **one iteration at a time**; don't skip ahead.",
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
    id: "cs-oop",
    name: "Object-Oriented Programming",
    order: 11,
    summary: "Classes, objects, encapsulation, inheritance and polymorphism.",
    detail: [
      "A **class** is a blueprint bundling **attributes** (data) and **methods** (behaviour); an **object** is an instance of it.",
      "**Encapsulation**: keep attributes `PRIVATE`, expose `PUBLIC` methods to control access.",
      "**Inheritance**: a subclass reuses and extends a superclass.",
      "**Polymorphism**: subclasses can override a method with their own version.",
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
    id: "cs-computational-thinking",
    name: "Computational Thinking",
    order: 12,
    summary: "Decomposition, abstraction and pattern recognition.",
    detail: [
      "**Decomposition**: break a big problem into smaller, solvable sub-problems.",
      "**Abstraction**: strip away irrelevant detail, keeping only what matters.",
      "**Pattern recognition**: spot repetition you can reuse or turn into a loop/function.",
      "Together they turn a vague task into an implementable algorithm.",
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
];

export function csTopicById(id: string): CSTopic | undefined {
  return CS_TOPICS.find((t) => t.id === id);
}
