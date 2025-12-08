"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ResidentsModal({ room, isOpen, onClose }: { room: any, isOpen: boolean, onClose: () => void }) {
    if (!room) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Room {room.number} - Residents</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {room.allotments?.length === 0 ? (
                        <p className="text-slate-500">No residents currently.</p>
                    ) : (
                        <div className="space-y-2">
                            {room.allotments?.map((allotment: any) => (
                                <div key={allotment.id} className="flex justify-between items-center p-3 border rounded-lg">
                                    <div>
                                        <p className="font-semibold">{allotment.student?.name || 'Unknown'}</p>
                                        <p className="text-sm text-slate-500">{allotment.student?.uniqueId}</p>
                                    </div>
                                    <Link href={`/admin/students/${allotment.student?.userId}`}>
                                        <Button size="sm" variant="outline">View Profile</Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
