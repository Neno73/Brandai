'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Upload, Trash } from '@phosphor-icons/react'

export default function ProductsPage() {
  const [productName, setProductName] = useState('')
  const [constraintText, setConstraintText] = useState('')
  const [colorLimits, setColorLimits] = useState('')
  const [printZones, setPrintZones] = useState('')

  // Mock products data
  const products = [
    {
      id: '1',
      name: 'T-Shirt Classic',
      colors: '5',
      printZones: '2',
      status: 'Active',
    },
    {
      id: '2',
      name: 'Hoodie Premium',
      colors: '8',
      printZones: '3',
      status: 'Active',
    },
    {
      id: '3',
      name: 'Mug Ceramic',
      colors: '10',
      printZones: '1',
      status: 'Draft',
    },
  ]

  const handleSaveProduct = () => {
    console.log('Saving product:', { productName, constraintText, colorLimits, printZones })
    // TODO: Implement save functionality
  }

  const handleUploadImage = () => {
    // TODO: Implement image upload
    console.log('Upload image clicked')
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background overflow-x-hidden font-sans">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <DashboardSidebar />

          {/* Main Content */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-foreground tracking-light text-[32px] font-bold leading-tight min-w-72">
                Products
              </p>
            </div>

            {/* Existing Products Table */}
            <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Existing Products
            </h2>

            <div className="px-4 py-3">
              <div className="flex overflow-hidden rounded-lg border border-border bg-background">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-background">
                      <th className="px-4 py-3 text-left text-foreground w-[400px] text-sm font-medium leading-normal">
                        Product Name
                      </th>
                      <th className="px-4 py-3 text-left text-foreground w-40 text-sm font-medium leading-normal">
                        Colors
                      </th>
                      <th className="px-4 py-3 text-left text-foreground w-40 text-sm font-medium leading-normal">
                        Print Zones
                      </th>
                      <th className="px-4 py-3 text-left text-foreground w-40 text-sm font-medium leading-normal">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-foreground w-40 text-sm font-medium leading-normal">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-t border-border">
                        <td className="h-[72px] px-4 py-2 w-[400px] text-muted-foreground text-sm font-normal leading-normal">
                          {product.name}
                        </td>
                        <td className="h-[72px] px-4 py-2 w-40 text-muted-foreground text-sm font-normal leading-normal">
                          {product.colors}
                        </td>
                        <td className="h-[72px] px-4 py-2 w-40 text-muted-foreground text-sm font-normal leading-normal">
                          {product.printZones}
                        </td>
                        <td className="h-[72px] px-4 py-2 w-40 text-sm font-normal leading-normal">
                          <Button variant="secondary" className="h-8 px-4 w-full">
                            {product.status}
                          </Button>
                        </td>
                        <td className="h-[72px] px-4 py-2 w-40 text-sm font-normal leading-normal">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Trash size={16} weight="regular" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add New Product Form */}
            <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Add New Product
            </h2>

            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-foreground text-base font-medium leading-normal pb-2">Product Name</p>
                <Input
                  placeholder="Enter product name"
                  className="h-14 text-base"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </label>
            </div>

            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-foreground text-base font-medium leading-normal pb-2">Constraint Text</p>
                <Textarea
                  placeholder="Enter constraint text for AI generation"
                  className="min-h-36 text-base"
                  value={constraintText}
                  onChange={(e) => setConstraintText(e.target.value)}
                />
              </label>
            </div>

            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-foreground text-base font-medium leading-normal pb-2">Color Limits</p>
                <Input
                  placeholder="Enter color limits (e.g., 5)"
                  className="h-14 text-base"
                  value={colorLimits}
                  onChange={(e) => setColorLimits(e.target.value)}
                />
              </label>
            </div>

            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-foreground text-base font-medium leading-normal pb-2">Print Zones</p>
                <Input
                  placeholder="Enter number of print zones"
                  className="h-14 text-base"
                  value={printZones}
                  onChange={(e) => setPrintZones(e.target.value)}
                />
              </label>
            </div>

            {/* Upload Section */}
            <div className="flex flex-col p-4">
              <div className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-border px-6 py-14">
                <div className="flex max-w-[480px] flex-col items-center gap-2">
                  <Upload size={48} weight="regular" className="text-muted-foreground" />
                  <p className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center">
                    Upload Base Product Mockup
                  </p>
                  <p className="text-muted-foreground text-sm font-normal leading-normal max-w-[480px] text-center">
                    Drag and drop or browse to upload your mockup image. Supported formats: PNG, JPG, SVG
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="h-10 px-4"
                  onClick={handleUploadImage}
                >
                  Browse Files
                </Button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex px-4 py-3 justify-start gap-3">
              <Button
                className="h-10 px-4"
                onClick={handleSaveProduct}
              >
                Save Product
              </Button>
              <Button
                variant="outline"
                className="h-10 px-4"
                onClick={() => {
                  setProductName('')
                  setConstraintText('')
                  setColorLimits('')
                  setPrintZones('')
                }}
              >
                Clear Form
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
