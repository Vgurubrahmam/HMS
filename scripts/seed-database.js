// Seed script to populate initial data
const mongoose = require("mongoose")

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/hackathonmanagementsystem")

// Define schemas (simplified for seeding)
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    studentId: String,
    department: String,
    year: String,
    phone: String,
    role: String,
    skills: [String],
    bio: String,
    expertise: [String],
    avatar: String,
  },
  { timestamps: true },
)

const hackathonSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    startDate: Date,
    endDate: Date,
    registrationDeadline: Date,
    registrationFee: Number,
    maxParticipants: Number,
    currentParticipants: { type: Number, default: 0 },
    venue: String,
    status: String,
    categories: [String],
    prizes: [String],
    requirements: [String],
    difficulty: String,
  },
  { timestamps: true },
)

const teamSchema = new mongoose.Schema(
  {
    name: String,
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    teamLead: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    projectTitle: String,
    projectDescription: String,
    progress: { type: Number, default: 0 },
    status: { type: String, default: "Active" },
    room: String,
    submissionStatus: { type: String, default: "Planning" },
    submissionUrl: String,
    score: Number,
    rank: Number,
  },
  { timestamps: true },
)

const registrationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon" },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    registrationDate: { type: Date, default: Date.now },
    paymentStatus: { type: String, default: "Pending" },
    paymentAmount: Number,
    paymentDate: Date,
    transactionId: String,
    status: { type: String, default: "Registered" },
  },
  { timestamps: true },
)

const certificateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon" },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    achievement: String,
    type: String,
    rank: Number,
    skills: [String],
    certificateNumber: String,
    issueDate: { type: Date, default: Date.now },
    verificationUrl: String,
  },
  { timestamps: true },
)

const User = mongoose.model("User", userSchema)
const Hackathon = mongoose.model("Hackathon", hackathonSchema)
const Team = mongoose.model("Team", teamSchema)
const Registration = mongoose.model("Registration", registrationSchema)
const Certificate = mongoose.model("Certificate", certificateSchema)

async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({})
    await Hackathon.deleteMany({})
    await Team.deleteMany({})
    await Registration.deleteMany({})
    await Certificate.deleteMany({})

    console.log("Cleared existing data")

    // Create Users
    const coordinator = await User.create({
      name: "Dr. Sarah Wilson",
      email: "sarah.wilson@university.edu",
      department: "Computer Science",
      role: "coordinator",
      phone: "+1-555-0101",
      bio: "Experienced hackathon coordinator with 10+ years in tech education",
      expertise: ["Event Management", "Technology", "Education"],
      avatar: "/placeholder.svg?height=40&width=40",
    })

    const faculty1 = await User.create({
      name: "Prof. Michael Chen",
      email: "michael.chen@university.edu",
      department: "Computer Science",
      role: "faculty",
      phone: "+1-555-0102",
      bio: "AI/ML researcher and educator",
      expertise: ["Artificial Intelligence", "Machine Learning", "Data Science"],
      avatar: "/placeholder.svg?height=40&width=40",
    })

    const faculty2 = await User.create({
      name: "Dr. Emily Rodriguez",
      email: "emily.rodriguez@university.edu",
      department: "Information Technology",
      role: "faculty",
      phone: "+1-555-0103",
      bio: "Cybersecurity expert and researcher",
      expertise: ["Cybersecurity", "Network Security", "Ethical Hacking"],
      avatar: "/placeholder.svg?height=40&width=40",
    })

    const mentor1 = await User.create({
      name: "Alex Thompson",
      email: "alex.thompson@techcorp.com",
      department: "Industry",
      role: "mentor",
      phone: "+1-555-0201",
      bio: "Senior Software Engineer at TechCorp",
      expertise: ["Full Stack Development", "React", "Node.js", "MongoDB"],
      avatar: "/placeholder.svg?height=40&width=40",
    })

    const mentor2 = await User.create({
      name: "Jessica Park",
      email: "jessica.park@startup.io",
      department: "Industry",
      role: "mentor",
      phone: "+1-555-0202",
      bio: "Blockchain developer and startup founder",
      expertise: ["Blockchain", "Smart Contracts", "Web3", "Solidity"],
      avatar: "/placeholder.svg?height=40&width=40",
    })

    const students = await User.insertMany([
      {
        name: "John Smith",
        email: "john.smith@student.edu",
        studentId: "CS2021001",
        department: "Computer Science",
        year: "3rd Year",
        role: "student",
        phone: "+1-555-1001",
        skills: ["JavaScript", "React", "Python", "Machine Learning"],
        bio: "Passionate about AI and web development",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "Emma Johnson",
        email: "emma.johnson@student.edu",
        studentId: "CS2021002",
        department: "Computer Science",
        year: "3rd Year",
        role: "student",
        phone: "+1-555-1002",
        skills: ["UI/UX Design", "Figma", "React", "CSS"],
        bio: "Creative designer with coding skills",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "David Lee",
        email: "david.lee@student.edu",
        studentId: "IT2021003",
        department: "Information Technology",
        year: "2nd Year",
        role: "student",
        phone: "+1-555-1003",
        skills: ["Java", "Spring Boot", "MySQL", "Android"],
        bio: "Backend developer and mobile app enthusiast",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "Sophie Chen",
        email: "sophie.chen@student.edu",
        studentId: "CS2022004",
        department: "Computer Science",
        year: "2nd Year",
        role: "student",
        phone: "+1-555-1004",
        skills: ["Python", "Data Science", "TensorFlow", "R"],
        bio: "Data science and AI enthusiast",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "Ryan Wilson",
        email: "ryan.wilson@student.edu",
        studentId: "IT2022005",
        department: "Information Technology",
        year: "2nd Year",
        role: "student",
        phone: "+1-555-1005",
        skills: ["Cybersecurity", "Linux", "Network Security", "Python"],
        bio: "Cybersecurity specialist in training",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "Lisa Wang",
        email: "lisa.wang@student.edu",
        studentId: "CS2021006",
        department: "Computer Science",
        year: "3rd Year",
        role: "student",
        phone: "+1-555-1006",
        skills: ["Blockchain", "Solidity", "Web3", "JavaScript"],
        bio: "Blockchain developer and crypto enthusiast",
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ])

    console.log("Created users")

    // Create Hackathons
    const hackathon1 = await Hackathon.create({
      title: "AI Innovation Challenge 2024",
      description:
        "Build innovative AI solutions for real-world problems using cutting-edge machine learning technologies. Participants will work on projects that address healthcare, education, or environmental challenges.",
      startDate: new Date("2024-02-15"),
      endDate: new Date("2024-02-17"),
      registrationDeadline: new Date("2024-02-10"),
      registrationFee: 50,
      maxParticipants: 200,
      currentParticipants: 156,
      venue: "Tech Hub Building A",
      status: "Registration Open",
      categories: ["AI/ML", "Computer Vision", "NLP", "Healthcare AI"],
      prizes: ["$5000", "$3000", "$1000"],
      requirements: ["Basic ML knowledge", "Python programming", "Team of 3-4 members"],
      difficulty: "Intermediate",
    })

    const hackathon2 = await Hackathon.create({
      title: "Web3 Developer Summit",
      description:
        "Explore the future of decentralized applications and blockchain technology. Build DApps, smart contracts, and innovative Web3 solutions.",
      startDate: new Date("2024-03-01"),
      endDate: new Date("2024-03-03"),
      registrationDeadline: new Date("2024-02-25"),
      registrationFee: 75,
      maxParticipants: 150,
      currentParticipants: 89,
      venue: "Innovation Center",
      status: "Registration Open",
      categories: ["Blockchain", "DeFi", "NFTs", "Smart Contracts"],
      prizes: ["$8000", "$5000", "$2000"],
      requirements: ["Solidity knowledge", "Web3 experience", "Team of 2-5 members"],
      difficulty: "Advanced",
    })

    const hackathon3 = await Hackathon.create({
      title: "Mobile App Hackathon",
      description:
        "Create the next generation of mobile applications for iOS and Android. Focus on user experience, performance, and innovative features.",
      startDate: new Date("2024-03-15"),
      endDate: new Date("2024-03-17"),
      registrationDeadline: new Date("2024-03-10"),
      registrationFee: 60,
      maxParticipants: 180,
      currentParticipants: 45,
      venue: "Campus Main Hall",
      status: "Registration Open",
      categories: ["iOS", "Android", "Cross-platform", "UI/UX"],
      prizes: ["$6000", "$4000", "$1500"],
      requirements: ["Mobile development basics", "Any mobile framework", "Team of 3-4 members"],
      difficulty: "Beginner",
    })

    const hackathon4 = await Hackathon.create({
      title: "Cybersecurity Challenge 2024",
      description:
        "Test your skills in ethical hacking and cybersecurity defense. Participate in capture-the-flag challenges and security assessments.",
      startDate: new Date("2024-01-20"),
      endDate: new Date("2024-01-22"),
      registrationDeadline: new Date("2024-01-15"),
      registrationFee: 40,
      maxParticipants: 100,
      currentParticipants: 100,
      venue: "Security Lab",
      status: "Completed",
      categories: ["Ethical Hacking", "Network Security", "Cryptography", "Forensics"],
      prizes: ["$4000", "$2500", "$1000"],
      requirements: ["Security fundamentals", "Linux knowledge", "Individual or team"],
      difficulty: "Advanced",
    })

    console.log("Created hackathons")

    // Create Teams
    const team1 = await Team.create({
      name: "Code Crushers",
      hackathon: hackathon1._id,
      members: [students[0]._id, students[1]._id, students[2]._id, students[3]._id],
      teamLead: students[0]._id,
      mentor: mentor1._id,
      projectTitle: "AI-Powered Healthcare Assistant",
      projectDescription:
        "An intelligent healthcare assistant that uses NLP and ML to provide medical advice and symptom analysis.",
      progress: 75,
      status: "Active",
      room: "Lab A-101",
      submissionStatus: "In Progress",
    })

    const team2 = await Team.create({
      name: "Blockchain Builders",
      hackathon: hackathon2._id,
      members: [students[4]._id, students[5]._id, students[0]._id],
      teamLead: students[5]._id,
      mentor: mentor2._id,
      projectTitle: "Decentralized Voting Platform",
      projectDescription:
        "A secure, transparent voting system built on blockchain technology with smart contract verification.",
      progress: 45,
      status: "Active",
      room: "Lab B-205",
      submissionStatus: "Planning",
    })

    const team3 = await Team.create({
      name: "Mobile Masters",
      hackathon: hackathon3._id,
      members: [students[1]._id, students[2]._id, students[3]._id],
      teamLead: students[1]._id,
      mentor: mentor1._id,
      projectTitle: "Fitness Tracking App",
      projectDescription: "A comprehensive fitness app with AI-powered workout recommendations and social features.",
      progress: 30,
      status: "Active",
      room: "Lab C-301",
      submissionStatus: "Planning",
    })

    console.log("Created teams")

    // Create Registrations
    await Registration.insertMany([
      {
        user: students[0]._id,
        hackathon: hackathon1._id,
        team: team1._id,
        paymentStatus: "Paid",
        paymentAmount: 50,
        paymentDate: new Date("2024-01-15"),
        transactionId: "TXN001",
        status: "Confirmed",
      },
      {
        user: students[1]._id,
        hackathon: hackathon1._id,
        team: team1._id,
        paymentStatus: "Paid",
        paymentAmount: 50,
        paymentDate: new Date("2024-01-15"),
        transactionId: "TXN002",
        status: "Confirmed",
      },
      {
        user: students[2]._id,
        hackathon: hackathon1._id,
        team: team1._id,
        paymentStatus: "Paid",
        paymentAmount: 50,
        paymentDate: new Date("2024-01-16"),
        transactionId: "TXN003",
        status: "Confirmed",
      },
      {
        user: students[5]._id,
        hackathon: hackathon2._id,
        team: team2._id,
        paymentStatus: "Paid",
        paymentAmount: 75,
        paymentDate: new Date("2024-01-20"),
        transactionId: "TXN004",
        status: "Confirmed",
      },
      {
        user: students[1]._id,
        hackathon: hackathon3._id,
        team: team3._id,
        paymentStatus: "Pending",
        paymentAmount: 60,
        status: "Registered",
      },
    ])

    console.log("Created registrations")

    // Create Certificates
    await Certificate.insertMany([
      {
        user: students[0]._id,
        hackathon: hackathon4._id,
        achievement: "2nd Place Winner",
        type: "Winner",
        rank: 2,
        skills: ["Ethical Hacking", "Network Security", "Python", "Linux"],
        certificateNumber: "CERT-SEC-2024-001",
        verificationUrl: "https://verify.university.edu/cert/CERT-SEC-2024-001",
      },
      {
        user: students[4]._id,
        hackathon: hackathon4._id,
        achievement: "3rd Place Winner",
        type: "Winner",
        rank: 3,
        skills: ["Cybersecurity", "Penetration Testing", "Network Analysis"],
        certificateNumber: "CERT-SEC-2024-002",
        verificationUrl: "https://verify.university.edu/cert/CERT-SEC-2024-002",
      },
      {
        user: students[1]._id,
        hackathon: hackathon4._id,
        achievement: "Best UI/UX Design",
        type: "Special Award",
        skills: ["UI/UX Design", "Security Interface Design", "User Experience"],
        certificateNumber: "CERT-SEC-2024-003",
        verificationUrl: "https://verify.university.edu/cert/CERT-SEC-2024-003",
      },
    ])

    console.log("Created certificates")
    console.log("Database seeded successfully!")

    // Print summary
    const userCount = await User.countDocuments()
    const hackathonCount = await Hackathon.countDocuments()
    const teamCount = await Team.countDocuments()
    const registrationCount = await Registration.countDocuments()
    const certificateCount = await Certificate.countDocuments()

    console.log("\n=== Database Summary ===")
    console.log(`Users: ${userCount}`)
    console.log(`Hackathons: ${hackathonCount}`)
    console.log(`Teams: ${teamCount}`)
    console.log(`Registrations: ${registrationCount}`)
    console.log(`Certificates: ${certificateCount}`)
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    mongoose.connection.close()
  }
}

seedDatabase()
