'use client'

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Ban, Mail } from 'lucide-react'

interface BlockedModalProps {
    isOpen: boolean
    onClose: () => void
}

export function BlockedModal({ isOpen, onClose }: BlockedModalProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                    <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <Ban className="h-6 w-6 text-red-600" />
                    </div>
                    <AlertDialogTitle className="text-center text-2xl font-bold text-gray-900">
                        Account Blocked
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center pt-2 text-gray-600">
                        Your account has been blocked for violating our terms of service or due to suspicious activity.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="bg-gray-50 p-4 rounded-lg my-4 flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary-600" />
                    <div className="text-sm">
                        <p className="font-medium text-gray-900">Contact Support</p>
                        <a
                            href="mailto:info@datthome.com"
                            className="text-primary-600 hover:text-primary-700 font-semibold"
                        >
                            info@datthome.com
                        </a>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogAction
                        onClick={onClose}
                        className="w-full bg-zinc-900 text-white hover:bg-zinc-800"
                    >
                        I Understand
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
