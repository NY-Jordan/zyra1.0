import React from 'react'
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from '@zyra/ui/components/drawer'
import { Button } from '@zyra/ui/components/button'
import { ShoppingCart } from 'lucide-react'
import { Booking } from '../../../../app/booking/[id]/types'
import { SidebarContent } from './SidebarContent'

interface MobileDrawerProps {
  multipleBookings: Booking[]
  currentPersonIndex: number
  currentStep: number
  onSelectBooking: (index: number) => void
  onDeleteBooking: (index: number) => void
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  multipleBookings,
  currentPersonIndex,
  currentStep,
  onSelectBooking,
  onDeleteBooking,
}) => {
  return (
    <div className="lg:hidden mb-4 flex justify-end">
      <Drawer>
        <DrawerTrigger asChild>
          <Button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-semibold">
              {multipleBookings.filter(b => b.service).length}/{multipleBookings.length}
            </span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="border-b">
            <DrawerTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Résumé ({multipleBookings.filter(b => b.service).length}/{multipleBookings.length})
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto">
            <SidebarContent
              multipleBookings={multipleBookings}
              currentPersonIndex={currentPersonIndex}
              currentStep={currentStep}
              onSelectBooking={onSelectBooking}
              onDeleteBooking={onDeleteBooking}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
