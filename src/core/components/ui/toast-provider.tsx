"use client";

import * as React from "react";
import { ToastProvider as RadixToastProvider } from "@radix-ui/react-toast";
import { useToast } from "../../hooks/useToast";
import { Toast } from "./toast";

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts } = useToast();

  return (
    <RadixToastProvider>
      {children}
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            title={title}
            description={description}
            action={action}
          />
        );
      })}
    </RadixToastProvider>
  );
}
