'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Session } from '@/lib/types/session'

interface SessionDetailProps {
  session: Session
}

export function SessionDetail({ session }: SessionDetailProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID</p>
              <p className="font-mono text-sm">{session.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge>{session.status}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{session.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">URL</p>
              <a
                href={session.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {session.url}
              </a>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">{formatDate(session.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Updated</p>
              <p className="text-sm">{formatDate(session.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scraped Data */}
      {session.scraped_data && (
        <Card>
          <CardHeader>
            <CardTitle>Scraped Data</CardTitle>
            <CardDescription>Brand information extracted from website</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {session.scraped_data.title && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Brand Name</p>
                <p>{session.scraped_data.title}</p>
              </div>
            )}

            {session.scraped_data.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{session.scraped_data.description}</p>
              </div>
            )}

            {session.scraped_data.logo && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Logo</p>
                <img
                  src={typeof session.scraped_data.logo === 'string' ? session.scraped_data.logo : session.scraped_data.logo.stored_url}
                  alt="Brand logo"
                  className="h-20 object-contain border rounded"
                />
              </div>
            )}

            {session.scraped_data.colors && session.scraped_data.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Colors</p>
                <div className="flex gap-2">
                  {session.scraped_data.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-12 h-12 rounded border"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs font-mono">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {session.scraped_data.fonts && session.scraped_data.fonts.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fonts</p>
                <p className="text-sm">{session.scraped_data.fonts.join(', ')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Concept */}
      {session.concept && (
        <Card>
          <CardHeader>
            <CardTitle>Design Concept</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{session.concept}</p>
          </CardContent>
        </Card>
      )}

      {/* Motif */}
      {session.motif_image_url && (
        <Card>
          <CardHeader>
            <CardTitle>Design Motif</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={session.motif_image_url}
              alt="Design motif"
              className="max-w-md mx-auto border rounded"
            />
          </CardContent>
        </Card>
      )}

      {/* Product Images */}
      {session.product_images && session.product_images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Product Mockups</CardTitle>
            <CardDescription>
              {session.product_images.length} product(s) generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {session.product_images.map((product, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <img
                    src={product.image_url}
                    alt={product.product_name}
                    className="w-full h-48 object-cover rounded mb-3"
                  />
                  <h4 className="font-medium">{product.product_name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {product.print_zones.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
