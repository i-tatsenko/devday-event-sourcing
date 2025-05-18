'use client'
import {useRouter, useSearchParams} from "next/navigation";
import {Link} from "@mui/material";

export const LogoutLink = () => {
    const repo = useSearchParams().get("repo")
    const router = useRouter()
    return <Link href='#' onClick={() => router.push(`/?repo=${repo}`)}>Logout</Link>
}