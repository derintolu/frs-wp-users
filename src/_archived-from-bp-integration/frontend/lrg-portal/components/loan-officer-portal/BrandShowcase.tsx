import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import svgPaths from "../../imports/svg-rfzpsqf1ya";

export function BrandShowcase() {
  return (
    <div className="space-y-8 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl" style={{ color: 'var(--brand-navy)' }}>Brand Style Guide</h1>
        <p className="text-muted-foreground">Your brand elements and design system</p>
      </div>

      {/* Brand Gradients */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: 'var(--brand-navy)' }}>Brand Gradients</CardTitle>
          <CardDescription>These gradients define your brand's visual identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div
                className="h-20 rounded-md shadow-sm relative overflow-hidden"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <span className="text-white font-medium text-sm bg-black/50 px-2 py-1 rounded">
                    Primary Brand Gradient
                  </span>
                </div>
              </div>
              <p className="font-medium" style={{ color: 'var(--brand-navy)' }}>
                Navy → Primary Blue → Rich Teal → Light Blue
              </p>
            </div>

            <div className="space-y-3">
              <div
                className="h-20 rounded-md shadow-sm relative overflow-hidden"
                style={{ background: 'var(--gradient-hero)' }}
              >
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <span className="text-white font-medium text-sm bg-black/50 px-2 py-1 rounded">
                    Hero Section Gradient
                  </span>
                </div>
              </div>
              <p className="font-medium" style={{ color: 'var(--brand-navy)' }}>
                Primary Blue → Rich Teal (135° diagonal)
              </p>
            </div>

            <div className="space-y-3">
              <div
                className="h-20 rounded-md shadow-sm relative overflow-hidden"
                style={{ background: 'var(--gradient-subtle)' }}
              >
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <span className="text-gray-700 font-medium text-sm bg-white/50 px-2 py-1 rounded">
                    Subtle Background Gradient
                  </span>
                </div>
              </div>
              <p className="font-medium" style={{ color: 'var(--brand-navy)' }}>
                Off White → Lighter Blue (vertical)
              </p>
            </div>

            <div className="space-y-3">
              <div
                className="h-20 rounded-md shadow-sm relative overflow-hidden"
                style={{ background: 'var(--gradient-button-hover)' }}
              >
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <span className="text-white font-medium text-sm bg-black/50 px-2 py-1 rounded">
                    Button Hover States
                  </span>
                </div>
              </div>
              <p className="font-medium" style={{ color: 'var(--brand-navy)' }}>
                Primary Blue → Rich Teal → Primary Blue
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Colors */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: 'var(--brand-navy)' }}>Brand Colors</CardTitle>
          <CardDescription>Core colors that define your brand palette</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="text-center space-y-2">
              <div className="h-16 w-full rounded-md shadow-sm" style={{ backgroundColor: 'var(--brand-navy)' }}></div>
              <div className="text-sm font-medium">Navy</div>
              <div className="text-xs text-muted-foreground">#263042</div>
            </div>
            <div className="text-center space-y-2">
              <div className="h-16 w-full rounded-md shadow-sm" style={{ backgroundColor: 'var(--brand-primary-blue)' }}></div>
              <div className="text-sm font-medium">Primary Blue</div>
              <div className="text-xs text-muted-foreground">#2563eb</div>
            </div>
            <div className="text-center space-y-2">
              <div className="h-16 w-full rounded-md shadow-sm" style={{ backgroundColor: 'var(--brand-rich-teal)' }}></div>
              <div className="text-sm font-medium">Rich Teal</div>
              <div className="text-xs text-muted-foreground">#2dd4da</div>
            </div>
            <div className="text-center space-y-2">
              <div className="h-16 w-full rounded-md shadow-sm" style={{ backgroundColor: 'var(--brand-light-blue)' }}></div>
              <div className="text-sm font-medium">Light Blue</div>
              <div className="text-xs text-muted-foreground">#c3d9f1</div>
            </div>
            <div className="text-center space-y-2">
              <div className="h-16 w-full rounded-lg shadow-md border" style={{ backgroundColor: 'var(--brand-off-white)' }}></div>
              <div className="text-sm font-medium">Off White</div>
              <div className="text-xs text-muted-foreground">#f8f7f9</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Variations */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: 'var(--brand-navy)' }}>Brand Logo Variations</CardTitle>
          <CardDescription>Different versions of your logo for various use cases</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <h4 className="font-medium mb-4" style={{ color: 'var(--brand-navy)' }}>Logo Mark (Icon Only)</h4>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="bg-white border rounded-md p-6 text-center space-y-3 shadow-sm">
                <div className="flex justify-center">
                  <svg className="size-20" fill="none" preserveAspectRatio="none" viewBox="0 0 80 80">
                    <g>
                      <path d={svgPaths.p119db800} fill="var(--brand-navy)" />
                    </g>
                  </svg>
                </div>
                <div className="text-xs font-medium text-muted-foreground">Primary Mark</div>
              </div>

              <div className="bg-gray-900 border rounded-md p-6 text-center space-y-3 shadow-sm">
                <div className="flex justify-center">
                  <svg className="size-15" fill="none" preserveAspectRatio="none" viewBox="0 0 60 60">
                    <g clipPath="url(#clip0_1_23)">
                      <path d={svgPaths.p1f6b6400} fill="white" />
                    </g>
                    <defs>
                      <clipPath id="clip0_1_23">
                        <rect fill="white" height="60" width="60" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div className="text-xs font-medium text-white">Reversed Mark</div>
              </div>

              <div className="border rounded-md p-6 text-center space-y-3 shadow-sm" style={{ background: 'var(--gradient-hero)' }}>
                <div className="flex justify-center">
                  <svg className="size-15" fill="none" preserveAspectRatio="none" viewBox="0 0 60 60">
                    <g clipPath="url(#clip0_1_23)">
                      <path d={svgPaths.p1f6b6400} fill="white" />
                    </g>
                    <defs>
                      <clipPath id="clip0_1_23">
                        <rect fill="white" height="60" width="60" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div className="text-xs font-medium text-white/90">Gradient Mark</div>
              </div>

              <div className="border rounded-md p-6 text-center space-y-3 shadow-sm" style={{ backgroundColor: 'var(--brand-rich-teal)' }}>
                <div className="flex justify-center">
                  <svg className="size-15" fill="none" preserveAspectRatio="none" viewBox="0 0 60 60">
                    <g clipPath="url(#clip0_1_23)">
                      <path d={svgPaths.p1f6b6400} fill="white" />
                    </g>
                    <defs>
                      <clipPath id="clip0_1_23">
                        <rect fill="white" height="60" width="60" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div className="text-xs font-medium text-white/90">Accent Mark</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Examples */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: 'var(--brand-navy)' }}>Interactive Elements</CardTitle>
          <CardDescription>Buttons and components using your brand styling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium" style={{ color: 'var(--brand-navy)' }}>Primary Actions</h4>
            <div className="flex flex-wrap gap-4">
              <Button
                className="text-white border-0 transition-all duration-200 hover:scale-105"
                style={{ background: 'var(--gradient-hero)' }}
              >
                Primary Button
              </Button>

              <Button
                variant="outline"
                className="transition-all duration-200 hover:text-white"
                style={{
                  borderColor: 'var(--brand-primary-blue)',
                  color: 'var(--brand-primary-blue)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--gradient-hero)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Secondary Button
              </Button>

              <Badge
                className="text-white"
                style={{ background: 'var(--brand-rich-teal)' }}
              >
                Brand Badge
              </Badge>

              <Badge
                variant="outline"
                style={{
                  borderColor: 'var(--brand-primary-blue)',
                  color: 'var(--brand-primary-blue)'
                }}
              >
                Outlined Badge
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium" style={{ color: 'var(--brand-navy)' }}>Brand Gradient Buttons</h4>
            <div className="flex flex-wrap gap-4">
              <Button
                className="text-white border-0 transition-all duration-300 hover:scale-105"
                style={{ background: 'var(--gradient-brand-blue)' }}
              >
                Brand Blue
              </Button>

              <Button
                className="text-white border-0 transition-all duration-300 hover:scale-105"
                style={{ background: 'var(--gradient-brand-teal)' }}
              >
                Brand Teal
              </Button>

              <Button
                className="text-white border-0 transition-all duration-300 hover:scale-105"
                style={{ background: 'var(--gradient-brand-navy)' }}
              >
                Brand Navy
              </Button>

              <Button
                className="text-white border-0 transition-all duration-300 hover:scale-105"
                style={{ background: 'var(--gradient-brand-accent)' }}
              >
                Brand Accent
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium" style={{ color: 'var(--brand-navy)' }}>Cards with Brand Styling</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-0 shadow-sm" style={{ background: 'var(--gradient-subtle)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--brand-navy)' }}>Subtle Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Using subtle background gradient</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm text-white" style={{ background: 'var(--gradient-hero)' }}>
                <CardHeader>
                  <CardTitle className="text-white">Hero Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80">Using primary brand gradient</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
