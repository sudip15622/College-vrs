'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, X, Upload, Image as ImageIcon } from 'lucide-react'
import { CreateListingFormSchema, CreateListingFormType, ImageFileSchema } from '@/lib/schemas/listing'
import { Textarea } from '../ui/textarea'
import { updateListingAction } from '@/lib/actions/listing'
import { fileToBase64 } from '@/lib/utils/image'

type EditListingFormProps = {
  listingId: string
  initialValues: CreateListingFormType
  currentImageUrl: string
}

export default function EditListingForm({
  listingId,
  initialValues,
  currentImageUrl,
}: EditListingFormProps) {
  const router = useRouter()
  const [currentFeature, setCurrentFeature] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(currentImageUrl)
  const [imageError, setImageError] = useState<string>('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateListingFormType>({
    resolver: zodResolver(CreateListingFormSchema),
    defaultValues: initialValues,
  })

  const watchedType = watch('type')
  const watchedFuelType = watch('fuelType')
  const watchedTransmission = watch('transmission')
  const watchedCondition = watch('condition')
  const watchedFeatures = watch('features')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const result = ImageFileSchema.safeParse(file)
      if (!result.success) {
        setImageError(result.error.issues[0].message)
        setImageFile(null)
        return
      }

      setImageError('')
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveSelectedImage = () => {
    setImageFile(null)
    setImagePreview(currentImageUrl)
    setImageError('')
    const fileInput = document.getElementById('image') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleAddFeature = () => {
    if (currentFeature.trim()) {
      const updatedFeatures = [...watchedFeatures, currentFeature.trim()]
      setValue('features', updatedFeatures)
      setCurrentFeature('')
    }
  }

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = watchedFeatures.filter((_, i) => i !== index)
    setValue('features', updatedFeatures)
  }

  const onSubmit = async (data: CreateListingFormType) => {
    try {
      let nextImageData: string | undefined

      if (imageFile) {
        const imageResult = ImageFileSchema.safeParse(imageFile)
        if (!imageResult.success) {
          const errorMsg = imageResult.error.issues[0].message
          setImageError(errorMsg)
          toast.error(errorMsg)
          return
        }

        nextImageData = await fileToBase64(imageFile)
      }

      const result = await updateListingAction({
        listingId,
        formData: data,
        imageData: nextImageData,
      })

      if (result.success) {
        toast.success(result.message || 'Listing updated successfully!')
        router.push(`/hosting/listings/${listingId}`)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update listing')
      }
    } catch (error) {
      console.error('Error submitting update form:', error)
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update essential details about your vehicle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Vehicle Type *</Label>
              <Select value={watchedType} onValueChange={(value) => setValue('type', value as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bike">Bike</SelectItem>
                  <SelectItem value="Scooter">Scooter</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Vehicle Name *</Label>
              <Input id="name" placeholder="e.g., Honda Activa 2023" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              <p className="text-xs text-muted-foreground">Include brand, model, and year</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" placeholder="Describe your vehicle in detail..." {...register('description')} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Specifications</CardTitle>
          <CardDescription>Update technical details and specifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fuelType">Fuel Type *</Label>
              <Select value={watchedFuelType} onValueChange={(value) => setValue('fuelType', value as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Petrol">Petrol</SelectItem>
                  <SelectItem value="Electric">Electric</SelectItem>
                </SelectContent>
              </Select>
              {errors.fuelType && <p className="text-sm text-destructive">{errors.fuelType.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transmission">Transmission *</Label>
              <Select
                value={watchedTransmission}
                onValueChange={(value) => setValue('transmission', value as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Automatic">Automatic</SelectItem>
                </SelectContent>
              </Select>
              {errors.transmission && (
                <p className="text-sm text-destructive">{errors.transmission.message}</p>
              )}
            </div>

            {watchedFuelType === 'Petrol' && (
              <div className="space-y-2">
                <Label htmlFor="engineCapacity">Engine Capacity (CC)</Label>
                <Input
                  id="engineCapacity"
                  type="number"
                  placeholder="e.g., 110"
                  {...register('engineCapacity')}
                />
                {errors.engineCapacity && (
                  <p className="text-sm text-destructive">{errors.engineCapacity.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="mileage">
                Mileage {watchedFuelType === 'Electric' ? '(km range)' : '(km/l)'}
              </Label>
              <Input
                id="mileage"
                type="number"
                placeholder={watchedFuelType === 'Electric' ? 'e.g., 80' : 'e.g., 45'}
                {...register('mileage')}
              />
              {errors.mileage && <p className="text-sm text-destructive">{errors.mileage.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition *</Label>
              <Select value={watchedCondition} onValueChange={(value) => setValue('condition', value as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                </SelectContent>
              </Select>
              {errors.condition && <p className="text-sm text-destructive">{errors.condition.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>Update your rental price</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="pricePerDay">Price Per Day (₹) *</Label>
            <Input id="pricePerDay" type="number" placeholder="e.g., 500" {...register('pricePerDay')} />
            {errors.pricePerDay && <p className="text-sm text-destructive">{errors.pricePerDay.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>Update special features and amenities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., ABS, Digital Display, USB Charging"
              value={currentFeature}
              onChange={(e) => setCurrentFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddFeature()
                }
              }}
            />
            <Button type="button" onClick={handleAddFeature} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {watchedFeatures.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {watchedFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                >
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="hover:text-destructive cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Image</CardTitle>
          <CardDescription>Keep current image or upload a new one</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!imagePreview ? (
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="image" className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="p-4 rounded-full bg-muted">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Click to upload image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                </label>
              </div>
              {imageError && <p className="text-sm text-destructive">{imageError}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <Label>Current Image</Label>
              <div className="relative border rounded-lg p-4">
                <img src={imagePreview} alt="Vehicle" className="w-full h-64 object-cover rounded-md" />
                {imageFile && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-6 right-6 bg-destructive text-card hover:bg-destructive/90 hover:text-card"
                    onClick={handleRemoveSelectedImage}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove New Image
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <div className='font-medium text-base leading-snug'>Replace Image (optional)</div>
                <Label htmlFor="image" className='py-2 px-4 rounded-sm bg-secondary text-secondary-foreground w-fit cursor-pointer'>Choose file</Label>
                <Input type="file" id="image" accept="image/*" onChange={handleImageChange} className='hidden'/>
              </div>

              {imageFile ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  <span>{imageFile.name}</span>
                  <span>({(imageFile.size / 1024).toFixed(2)} KB)</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No new image selected. Current image will be kept.</p>
              )}

              {imageError && <p className="text-sm text-destructive">{imageError}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Listing...
            </>
          ) : (
            'Update Listing'
          )}
        </Button>
      </div>
    </form>
  )
}
