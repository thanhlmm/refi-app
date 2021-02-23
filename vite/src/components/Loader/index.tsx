import { Spinner } from "@zendeskgarden/react-loaders";
import React, { ReactNode } from "react";

interface ILoaderProps {
  children: ReactNode;
}

const Loader: React.FC<ILoaderProps> = ({ children }: ILoaderProps) => {
  return <React.Suspense fallback={<Spinner />}>{children}</React.Suspense>;
};

export default Loader;
