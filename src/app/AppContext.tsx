'use client'
import {RepositoryType} from "@/be/repository-provider";
import {createContext, PropsWithChildren} from "react";

interface AppSession {
    userId: string;
    repo: RepositoryType;
}
export const AppSessionContext = createContext<AppSession>({} as AppSession);

export interface Props extends PropsWithChildren {
    userId: string;
    repo: RepositoryType;
}
export const WithAppSession = ({children, userId, repo}: Props) => {
    return <AppSessionContext.Provider value={{userId, repo}}>
        {children}
    </AppSessionContext.Provider>
}