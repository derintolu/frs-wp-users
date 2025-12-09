"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  Rectangle,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"

export default function Charts() {
  return (
    <div className="chart-wrapper mx-auto flex max-w-6xl flex-col flex-wrap items-start justify-center gap-6 p-6 sm:flex-row sm:p-8">
      <div className="grid w-full gap-6 sm:grid-cols-2 lg:max-w-[22rem] lg:grid-cols-1 xl:max-w-[25rem]">
        <Card
          className="lg:max-w-md" x-chunk="charts-01-chunk-0"
        >
          <CardHeader className="space-y-0 pb-2">
            <CardDescription>Today</CardDescription>
            <CardTitle className="text-4xl tabular-nums">
              12,584{" "}
              <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
                steps
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                steps: {
                  color: "hsl(var(--chart-1))",
                  label: "Steps",
                },
              }}
            >
              <BarChart
                accessibilityLayer
                data={[
                  {
                    date: "2024-01-01",
                    steps: 2000,
                  },
                  {
                    date: "2024-01-02",
                    steps: 2100,
                  },
                  {
                    date: "2024-01-03",
                    steps: 2200,
                  },
                  {
                    date: "2024-01-04",
                    steps: 1300,
                  },
                  {
                    date: "2024-01-05",
                    steps: 1400,
                  },
                  {
                    date: "2024-01-06",
                    steps: 2500,
                  },
                  {
                    date: "2024-01-07",
                    steps: 1600,
                  },
                ]}
                margin={{
                  left: -4,
                  right: -4,
                }}
              >
                <Bar
                  activeBar={<Rectangle fillOpacity={0.8} />}
                  dataKey="steps"
                  fill="var(--color-steps)"
                  fillOpacity={0.6}
                  radius={5}
                />
                <XAxis
                  axisLine={false}
                  dataKey="date"
                  tickFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      weekday: "short",
                    })
                  }}
                  tickLine={false}
                  tickMargin={4}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideIndicator
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      }}
                    />
                  }
                  cursor={false}
                  defaultIndex={2}
                />
                <ReferenceLine
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  y={1200}
                >
                  <Label
                    fill="hsl(var(--foreground))"
                    offset={10}
                    position="insideBottomLeft"
                    value="Average Steps"
                  />
                  <Label
                    className="text-lg"
                    fill="hsl(var(--foreground))"
                    offset={10}
                    position="insideTopLeft"
                    startOffset={100}
                    value="12,343"
                  />
                </ReferenceLine>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-1">
            <CardDescription>
              Over the past 7 days, you have walked{" "}
              <span className="font-medium text-foreground">53,305</span> steps.
            </CardDescription>
            <CardDescription>
              You need{" "}
              <span className="font-medium text-foreground">12,584</span> more
              steps to reach your goal.
            </CardDescription>
          </CardFooter>
        </Card>
        <Card
          className="flex flex-col lg:max-w-md" x-chunk="charts-01-chunk-1"
        >
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2 [&>div]:flex-1">
            <div>
              <CardDescription>Resting HR</CardDescription>
              <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
                62
                <span className="text-sm font-normal tracking-normal text-muted-foreground">
                  bpm
                </span>
              </CardTitle>
            </div>
            <div>
              <CardDescription>Variability</CardDescription>
              <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
                35
                <span className="text-sm font-normal tracking-normal text-muted-foreground">
                  ms
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 items-center">
            <ChartContainer
              className="w-full"
              config={{
                resting: {
                  color: "hsl(var(--chart-1))",
                  label: "Resting",
                },
              }}
            >
              <LineChart
                accessibilityLayer
                data={[
                  {
                    date: "2024-01-01",
                    resting: 62,
                  },
                  {
                    date: "2024-01-02",
                    resting: 72,
                  },
                  {
                    date: "2024-01-03",
                    resting: 35,
                  },
                  {
                    date: "2024-01-04",
                    resting: 62,
                  },
                  {
                    date: "2024-01-05",
                    resting: 52,
                  },
                  {
                    date: "2024-01-06",
                    resting: 62,
                  },
                  {
                    date: "2024-01-07",
                    resting: 70,
                  },
                ]}
                margin={{
                  left: 14,
                  right: 14,
                  top: 10,
                }}
              >
                <CartesianGrid
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  vertical={false}
                />
                <YAxis domain={["dataMin - 10", "dataMax + 10"]} hide />
                <XAxis
                  axisLine={false}
                  dataKey="date"
                  tickFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      weekday: "short",
                    })
                  }}
                  tickLine={false}
                  tickMargin={8}
                />
                <Line
                  activeDot={{
                    fill: "var(--color-resting)",
                    r: 4,
                    stroke: "var(--color-resting)",
                  }}
                  dataKey="resting"
                  dot={false}
                  fill="var(--color-resting)"
                  stroke="var(--color-resting)"
                  strokeWidth={2}
                  type="natural"
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      }}
                    />
                  }
                  cursor={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid w-full flex-1 gap-6 lg:max-w-[20rem]">
        <Card
          className="max-w-xs" x-chunk="charts-01-chunk-2"
        >
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>
              You&apos;re average more steps a day this year than last year.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid auto-rows-min gap-2">
              <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                12,453
                <span className="text-sm font-normal text-muted-foreground">
                  steps/day
                </span>
              </div>
              <ChartContainer
                className="aspect-auto h-[32px] w-full"
                config={{
                  steps: {
                    color: "hsl(var(--chart-1))",
                    label: "Steps",
                  },
                }}
              >
                <BarChart
                  accessibilityLayer
                  data={[
                    {
                      date: "2024",
                      steps: 12_435,
                    },
                  ]}
                  layout="vertical"
                  margin={{
                    bottom: 0,
                    left: 0,
                    right: 0,
                    top: 0,
                  }}
                >
                  <Bar
                    barSize={32}
                    dataKey="steps"
                    fill="var(--color-steps)"
                    radius={4}
                  >
                    <LabelList
                      dataKey="date"
                      fill="white"
                      fontSize={12}
                      offset={8}
                      position="insideLeft"
                    />
                  </Bar>
                  <YAxis dataKey="date" hide tickCount={1} type="category" />
                  <XAxis dataKey="steps" hide type="number" />
                </BarChart>
              </ChartContainer>
            </div>
            <div className="grid auto-rows-min gap-2">
              <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                10,103
                <span className="text-sm font-normal text-muted-foreground">
                  steps/day
                </span>
              </div>
              <ChartContainer
                className="aspect-auto h-[32px] w-full"
                config={{
                  steps: {
                    color: "hsl(var(--muted))",
                    label: "Steps",
                  },
                }}
              >
                <BarChart
                  accessibilityLayer
                  data={[
                    {
                      date: "2023",
                      steps: 10_103,
                    },
                  ]}
                  layout="vertical"
                  margin={{
                    bottom: 0,
                    left: 0,
                    right: 0,
                    top: 0,
                  }}
                >
                  <Bar
                    barSize={32}
                    dataKey="steps"
                    fill="var(--color-steps)"
                    radius={4}
                  >
                    <LabelList
                      dataKey="date"
                      fill="hsl(var(--muted-foreground))"
                      fontSize={12}
                      offset={8}
                      position="insideLeft"
                    />
                  </Bar>
                  <YAxis dataKey="date" hide tickCount={1} type="category" />
                  <XAxis dataKey="steps" hide type="number" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        <Card
          className="max-w-xs" x-chunk="charts-01-chunk-3"
        >
          <CardHeader className="p-4 pb-0">
            <CardTitle>Walking Distance</CardTitle>
            <CardDescription>
              Over the last 7 days, your distance walked and run was 12.5 miles
              per day.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0">
            <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
              12.5
              <span className="text-sm font-normal text-muted-foreground">
                miles/day
              </span>
            </div>
            <ChartContainer
              className="ml-auto w-[72px]"
              config={{
                steps: {
                  color: "hsl(var(--chart-1))",
                  label: "Steps",
                },
              }}
            >
              <BarChart
                accessibilityLayer
                data={[
                  {
                    date: "2024-01-01",
                    steps: 2000,
                  },
                  {
                    date: "2024-01-02",
                    steps: 2100,
                  },
                  {
                    date: "2024-01-03",
                    steps: 2200,
                  },
                  {
                    date: "2024-01-04",
                    steps: 1300,
                  },
                  {
                    date: "2024-01-05",
                    steps: 1400,
                  },
                  {
                    date: "2024-01-06",
                    steps: 2500,
                  },
                  {
                    date: "2024-01-07",
                    steps: 1600,
                  },
                ]}
                margin={{
                  bottom: 0,
                  left: 0,
                  right: 0,
                  top: 0,
                }}
              >
                <Bar
                  activeBar={<Rectangle fillOpacity={0.8} />}
                  activeIndex={6}
                  dataKey="steps"
                  fill="var(--color-steps)"
                  fillOpacity={0.2}
                  radius={2}
                />
                <XAxis
                  axisLine={false}
                  dataKey="date"
                  hide
                  tickLine={false}
                  tickMargin={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card
          className="max-w-xs" x-chunk="charts-01-chunk-4"
        >
          <CardContent className="flex gap-4 p-4 pb-2">
            <ChartContainer
              className="h-[140px] w-full"
              config={{
                exercise: {
                  color: "hsl(var(--chart-3))",
                  label: "Exercise",
                },
                move: {
                  color: "hsl(var(--chart-1))",
                  label: "Move",
                },
                stand: {
                  color: "hsl(var(--chart-2))",
                  label: "Stand",
                },
              }}
            >
              <BarChart
                barGap={2}
                barSize={32}
                data={[
                  {
                    activity: "stand",
                    fill: "var(--color-stand)",
                    label: "8/12 hr",
                    value: (8 / 12) * 100,
                  },
                  {
                    activity: "exercise",
                    fill: "var(--color-exercise)",
                    label: "46/60 min",
                    value: (46 / 60) * 100,
                  },
                  {
                    activity: "move",
                    fill: "var(--color-move)",
                    label: "245/360 kcal",
                    value: (245 / 360) * 100,
                  },
                ]}
                layout="vertical"
                margin={{
                  bottom: 10,
                  left: 0,
                  right: 0,
                  top: 0,
                }}
              >
                <XAxis dataKey="value" hide type="number" />
                <YAxis
                  axisLine={false}
                  className="capitalize"
                  dataKey="activity"
                  tickLine={false}
                  tickMargin={4}
                  type="category"
                />
                <Bar dataKey="value" radius={5}>
                  <LabelList
                    dataKey="label"
                    fill="white"
                    fontSize={12}
                    offset={8}
                    position="insideLeft"
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex flex-row border-t p-4">
            <div className="flex w-full items-center gap-2">
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-xs text-muted-foreground">Move</div>
                <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                  562
                  <span className="text-sm font-normal text-muted-foreground">
                    kcal
                  </span>
                </div>
              </div>
              <Separator className="mx-2 h-10 w-px" orientation="vertical" />
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-xs text-muted-foreground">Exercise</div>
                <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                  73
                  <span className="text-sm font-normal text-muted-foreground">
                    min
                  </span>
                </div>
              </div>
              <Separator className="mx-2 h-10 w-px" orientation="vertical" />
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-xs text-muted-foreground">Stand</div>
                <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                  14
                  <span className="text-sm font-normal text-muted-foreground">
                    hr
                  </span>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="grid w-full flex-1 gap-6">
        <Card
          className="max-w-xs" x-chunk="charts-01-chunk-5"
        >
          <CardContent className="flex gap-4 p-4">
            <div className="grid items-center gap-2">
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-sm text-muted-foreground">Move</div>
                <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
                  562/600
                  <span className="text-sm font-normal text-muted-foreground">
                    kcal
                  </span>
                </div>
              </div>
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-sm text-muted-foreground">Exercise</div>
                <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
                  73/120
                  <span className="text-sm font-normal text-muted-foreground">
                    min
                  </span>
                </div>
              </div>
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-sm text-muted-foreground">Stand</div>
                <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
                  8/12
                  <span className="text-sm font-normal text-muted-foreground">
                    hr
                  </span>
                </div>
              </div>
            </div>
            <ChartContainer
              className="mx-auto aspect-square w-full max-w-[80%]"
              config={{
                exercise: {
                  color: "hsl(var(--chart-2))",
                  label: "Exercise",
                },
                move: {
                  color: "hsl(var(--chart-1))",
                  label: "Move",
                },
                stand: {
                  color: "hsl(var(--chart-3))",
                  label: "Stand",
                },
              }}
            >
              <RadialBarChart
                barSize={24}
                data={[
                  {
                    activity: "stand",
                    fill: "var(--color-stand)",
                    value: (8 / 12) * 100,
                  },
                  {
                    activity: "exercise",
                    fill: "var(--color-exercise)",
                    value: (46 / 60) * 100,
                  },
                  {
                    activity: "move",
                    fill: "var(--color-move)",
                    value: (245 / 360) * 100,
                  },
                ]}
                endAngle={450}
                innerRadius="20%"
                margin={{
                  bottom: -10,
                  left: -10,
                  right: -10,
                  top: -10,
                }}
                startAngle={90}
              >
                <PolarAngleAxis
                  dataKey="value"
                  domain={[0, 100]}
                  tick={false}
                  type="number"
                />
                <RadialBar background cornerRadius={5} dataKey="value" />
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card
          className="max-w-xs" x-chunk="charts-01-chunk-6"
        >
          <CardHeader className="p-4 pb-0">
            <CardTitle>Active Energy</CardTitle>
            <CardDescription>
              You&apos;re burning an average of 754 calories per day. Good job!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-2">
            <div className="flex items-baseline gap-2 text-3xl font-bold tabular-nums leading-none">
              1,254
              <span className="text-sm font-normal text-muted-foreground">
                kcal/day
              </span>
            </div>
            <ChartContainer
              className="ml-auto w-[64px]"
              config={{
                calories: {
                  color: "hsl(var(--chart-1))",
                  label: "Calories",
                },
              }}
            >
              <BarChart
                accessibilityLayer
                data={[
                  {
                    calories: 354,
                    date: "2024-01-01",
                  },
                  {
                    calories: 514,
                    date: "2024-01-02",
                  },
                  {
                    calories: 345,
                    date: "2024-01-03",
                  },
                  {
                    calories: 734,
                    date: "2024-01-04",
                  },
                  {
                    calories: 645,
                    date: "2024-01-05",
                  },
                  {
                    calories: 456,
                    date: "2024-01-06",
                  },
                  {
                    calories: 345,
                    date: "2024-01-07",
                  },
                ]}
                margin={{
                  bottom: 0,
                  left: 0,
                  right: 0,
                  top: 0,
                }}
              >
                <Bar
                  activeBar={<Rectangle fillOpacity={0.8} />}
                  activeIndex={6}
                  dataKey="calories"
                  fill="var(--color-calories)"
                  fillOpacity={0.2}
                  radius={2}
                />
                <XAxis
                  axisLine={false}
                  dataKey="date"
                  hide
                  tickLine={false}
                  tickMargin={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card
          className="max-w-xs" x-chunk="charts-01-chunk-7"
        >
          <CardHeader className="space-y-0 pb-0">
            <CardDescription>Time in Bed</CardDescription>
            <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
              8
              <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
                hr
              </span>
              35
              <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
                min
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ChartContainer
              config={{
                time: {
                  color: "hsl(var(--chart-2))",
                  label: "Time",
                },
              }}
            >
              <AreaChart
                accessibilityLayer
                data={[
                  {
                    date: "2024-01-01",
                    time: 8.5,
                  },
                  {
                    date: "2024-01-02",
                    time: 7.2,
                  },
                  {
                    date: "2024-01-03",
                    time: 8.1,
                  },
                  {
                    date: "2024-01-04",
                    time: 6.2,
                  },
                  {
                    date: "2024-01-05",
                    time: 5.2,
                  },
                  {
                    date: "2024-01-06",
                    time: 8.1,
                  },
                  {
                    date: "2024-01-07",
                    time: 7.0,
                  },
                ]}
                margin={{
                  bottom: 0,
                  left: 0,
                  right: 0,
                  top: 0,
                }}
              >
                <XAxis dataKey="date" hide />
                <YAxis domain={["dataMin - 5", "dataMax + 2"]} hide />
                <defs>
                  <linearGradient id="fillTime" x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-time)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-time)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="time"
                  fill="url(#fillTime)"
                  fillOpacity={0.4}
                  stroke="var(--color-time)"
                  type="natural"
                />
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel />}
                  cursor={false}
                  formatter={(value) => (
                    <div className="flex min-w-[120px] items-center text-xs text-muted-foreground">
                      Time in bed
                      <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                        {value}
                        <span className="font-normal text-muted-foreground">
                          hr
                        </span>
                      </div>
                    </div>
                  )}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
