import { getAuth } from "@/lib/auth";

// Better Auth's endpoints, e.g. /api/auth/callback/github after GitHub sign-in.
const handler = (request: Request) => getAuth().handler(request);

export { handler as GET, handler as POST };
