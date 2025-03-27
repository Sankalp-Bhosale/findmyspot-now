
import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
  type EmblaCarouselType,
} from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  opts?: Parameters<typeof useEmblaCarousel>[0]
  plugins?: Parameters<typeof useEmblaCarousel>[1]
  children: React.ReactNode
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, children, opts, plugins, ...props }, ref) => {
    const [emblaRef, emblaApi] = useEmblaCarousel(opts, plugins)

    const [prevBtnEnabled, setPrevBtnEnabled] = React.useState(false)
    const [nextBtnEnabled, setNextBtnEnabled] = React.useState(false)

    const onSelect = React.useCallback((api: EmblaCarouselType) => {
      setPrevBtnEnabled(api.canScrollPrev())
      setNextBtnEnabled(api.canScrollNext())
    }, [])

    React.useEffect(() => {
      if (!emblaApi) return
      onSelect(emblaApi)
      emblaApi.on("select", () => {
        onSelect(emblaApi)
      })
    }, [emblaApi, onSelect])

    return (
      <div className={cn("relative", className)} {...props} ref={ref}>
        <div className="overflow-hidden">
          <div className="flex" ref={emblaRef}>
            {React.Children.map(children, (child, index) => (
              <div className="relative min-w-full" key={index}>
                {child}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-1/2 left-2 z-10 -translate-y-1/2">
          <Button
            variant="ghost"
            size="icon"
            disabled={!prevBtnEnabled}
            onClick={() => emblaApi?.scrollPrev()}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
        </div>
        <div className="absolute top-1/2 right-2 z-10 -translate-y-1/2">
          <Button
            variant="ghost"
            size="icon"
            disabled={!nextBtnEnabled}
            onClick={() => emblaApi?.scrollNext()}
            className="rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      </div>
    )
  }
)
Carousel.displayName = "Carousel"

interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn("relative min-h-full min-w-full", className)}
        {...props}
        ref={ref}
      />
    )
  }
)
CarouselItem.displayName = "CarouselItem"

interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn("flex", className)} {...props} ref={ref} />
    )
  }
)
CarouselContent.displayName = "CarouselContent"

interface CarouselPreviousProps
  extends React.HTMLAttributes<HTMLButtonElement> {}

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  CarouselPreviousProps
>(({ className, ...props }, ref) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("absolute left-2 top-1/2 -translate-y-1/2", className)}
      {...props}
      ref={ref}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

interface CarouselNextProps extends React.HTMLAttributes<HTMLButtonElement> {}

const CarouselNext = React.forwardRef<HTMLButtonElement, CarouselNextProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("absolute right-2 top-1/2 -translate-y-1/2", className)}
        {...props}
        ref={ref}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next</span>
      </Button>
    )
  }
)
CarouselNext.displayName = "CarouselNext"

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
