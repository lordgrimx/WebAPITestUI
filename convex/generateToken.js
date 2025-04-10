"use node";

import { action } from "./_generated/server";
import jwt from "jsonwebtoken";
import Cookies from "js-cookie";
import { v } from "convex/values";


export const generateToken = action({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const token = jwt.sign({ userId: args.userId }, process.env.JWT_SECRET || "OUIAHFNBOUIAHWNFUOIAWHNFUAWDF", {
            expiresIn: "1d",
        });
        Cookies.set("token", token, { expires: 1 }); // 1 gün geçerli
        return { success: true, token };
    },
});
