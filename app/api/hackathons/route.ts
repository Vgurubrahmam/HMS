import { NextResponse } from "next/server";
import db from "@/lib/db";
import createHackathon from "@/lib/models/Hackathon";

interface HackathonRequestBody {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline:string,
  registrationFee: number;
  maxParticipants: number;
  venue: string;
  categories: string[];
  prizes: string[];
  currentParticipants: number;
  mentorsAssigned: string;
  teamsFormed: string;
  mentorAssigned: string; // Added mentorAssigned here
}

interface HackathonResponse {
  message: string;
  hackathon?: unknown;
}

export async function POST(req: Request): Promise<Response> {
  await db();
  const {
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
    mentorAssigned, // Added mentorAssigned here
  }: HackathonRequestBody = await req.json();
  try {
    const newHackathon = new createHackathon({
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
      mentorAssigned, // Added mentorAssigned here
    });
    await newHackathon.save();
    return NextResponse.json(
      {
        message: "Hackathon created successfully",
        hackathon: newHackathon,
      } as HackathonResponse,
      { status: 201 }
    );
  } catch (error) {
    // console.error("Error creating hackathon:", error);
    return NextResponse.json(
      { message: "Internal server error" } as HackathonResponse,
      { status: 500 }
    );
  }
}

// get hackathons

interface HackathonData {
  // Define the properties of a hackathon as per your schema
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline:string;
  registrationFee: number;
  maxParticipants: number;
  venue: string;
  categories: string[];
  prizes: string[];
  currentParticipants: number;
  mentorAssigned: string;
  teamsFormed: string;
  // Add other fields if present in your schema
}

interface HackathonsResponse {
  message: string;
  data?: HackathonData[];
}

export async function GET(
  req: Request
): Promise<Response> {
  await db();
  try {
    const data: HackathonData[] = await createHackathon.find();
    return NextResponse.json(
      { message: "Hackathons  Feteched  successfully", data } as HackathonsResponse,
      { status: 201 }
    );
  } catch (error) {
    // console.error("Error fetching hackathons:", error);
    return NextResponse.json({ message: "Internal Server Error" } as HackathonsResponse);
  }
}


