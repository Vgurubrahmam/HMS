import { NextResponse } from "next/server";
import db from "@/lib/db";
import Hackathon from "@/lib/models/Hackathon";
import Registration from "@/lib/models/Registration";

interface HackathonData {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  registrationFee: number;
  maxParticipants: number;
  venue: string;
  categories: string[];
  prizes: string[];
  currentParticipants: number;
  mentorAssigned: string;
  teamsFormed: string;
  status: string;
  difficulty: string;
  organizer?: { name: string };
  requirements?: string[];
}

interface HackathonsResponse {
  success: boolean;
  message: string;
  data?: HackathonData[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function GET(req: Request): Promise<Response> {
  try {
    await db();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status");
    const difficulty = searchParams.get("difficulty");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid pagination parameters",
          error: "Page and limit must be positive integers",
        } as HackathonsResponse,
        { status: 400 }
      );
    }

    // Validate status and difficulty against allowed values
    const validStatuses = ["Registration Open", "Active", "Planning", "Completed"];
    const validDifficulties = ["Beginner", "Intermediate", "Advanced"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status filter",
          error: `Status must be one of: ${validStatuses.join(", ")}`,
        } as HackathonsResponse,
        { status: 400 }
      );
    }
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid difficulty filter",
          error: `Difficulty must be one of: ${validDifficulties.join(", ")}`,
        } as HackathonsResponse,
        { status: 400 }
      );
    }

    // Build query
    let query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (status) query.status = status;
    if (difficulty) query.difficulty = difficulty;

    // Fetch data with pagination and sorting
    const total = await Hackathon.countDocuments(query);
    const hackathons = await Hackathon.find(query)
      .sort({ startDate: -1 }) // Sort by startDate descending (most recent first)
      .skip((page - 1) * limit)
      .limit(limit);

    // Dynamically calculate current participants for each hackathon
    const data: HackathonData[] = await Promise.all(
      hackathons.map(async (hackathon) => {
        // Count confirmed registrations (either Completed payment or Registered status)
        const confirmedRegistrations = await Registration.countDocuments({
          hackathon: hackathon._id,
          $or: [
            { paymentStatus: "Completed" },
            { paymentStatus: "Registered" }
          ]
        });

        return {
          ...hackathon.toObject(),
          currentParticipants: confirmedRegistrations
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        message: "Hackathons fetched successfully",
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      } as HackathonsResponse,
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching hackathons:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch hackathons",
        error: error.message || "Internal Server Error",
      } as HackathonsResponse,
      { status: 500 }
    );
  }
}

interface HackathonRequestBody {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  registrationFee: number;
  maxParticipants: number;
  venue: string;
  categories: string[];
  prizes: string[];
  currentParticipants: number;
  mentorAssigned: string;
  teamsFormed: string;
  status: string;
  difficulty: string;
  organizer?: { name: string };
  requirements?: string[];
}

interface HackathonResponse {
  success: boolean;
  message: string;
  hackathon?: unknown;
  error?: string;
}

export async function POST(req: Request): Promise<Response> {
  try {
    await db();
    const body: HackathonRequestBody = await req.json();

    // Validate required fields
    const {
      title,
      description,
      startDate,
      endDate,
      registrationDeadline,
      registrationFee = 0,
      maxParticipants,
      venue,
      categories = [],
      prizes = [],
      currentParticipants = 0,
      teamsFormed = "",
      mentorAssigned = "",
      status = "Planning",
      difficulty = "Intermediate",
      organizer = { name: "University" },
      requirements = [],
    } = body;

    if (!title || !description || !startDate || !endDate || !registrationDeadline || !venue || !maxParticipants) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          error: "Title, description, startDate, endDate, registrationDeadline, venue, and maxParticipants are required",
        } as HackathonResponse,
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (registrationFee < 0 || maxParticipants < 1 || currentParticipants < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid numeric values",
          error: "Registration fee and current participants must be non-negative, and max participants must be positive",
        } as HackathonResponse,
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const deadline = new Date(registrationDeadline);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || isNaN(deadline.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid date format",
          error: "startDate, endDate, and registrationDeadline must be valid dates",
        } as HackathonResponse,
        { status: 400 }
      );
    }
    if (start >= end || deadline > start) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid date logic",
          error: "startDate must be before endDate, and registrationDeadline must be before startDate",
        } as HackathonResponse,
        { status: 400 }
      );
    }

    // Validate status and difficulty
    const validStatuses = ["Registration Open", "Active", "Planning", "Completed"];
    const validDifficulties = ["Beginner", "Intermediate", "Advanced"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status",
          error: `Status must be one of: ${validStatuses.join(", ")}`,
        } as HackathonResponse,
        { status: 400 }
      );
    }
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid difficulty",
          error: `Difficulty must be one of: ${validDifficulties.join(", ")}`,
        } as HackathonResponse,
        { status: 400 }
      );
    }

    const newHackathon = new Hackathon({
      title,
      description,
      startDate,
      endDate,
      registrationDeadline,
      registrationFee,
      maxParticipants,
      venue,
      categories,
      prizes,
      currentParticipants,
      teamsFormed,
      mentorAssigned,
      status,
      difficulty,
      organizer,
      requirements,
    });
    await newHackathon.save();

    return NextResponse.json(
      {
        success: true,
        message: "Hackathon created successfully",
        hackathon: newHackathon,
      } as HackathonResponse,
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating hackathon:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create hackathon",
        error: error.message || "Internal Server Error",
      } as HackathonResponse,
      { status: 500 }
    );
  }
}