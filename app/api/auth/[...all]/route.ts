//auth route handler
//exposed by better auth
//handle authentication and user session

import { auth } from "@/app/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
