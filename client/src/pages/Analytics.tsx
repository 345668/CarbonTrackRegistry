import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  AreaChart,
  Area
} from 'recharts';
import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BarChart2, PieChart as PieChartIcon, TrendingUp, Folder, Landmark, Calendar, CheckCircle2 } from 'lucide-react';

// Sample data for SDG impacts
const sdgImpactData = [
  { name: 'No Poverty', value: 78, goal: 90, color: '#e5243b' },
  { name: 'Zero Hunger', value: 62, goal: 85, color: '#dda63a' },
  { name: 'Good Health', value: 83, goal: 90, color: '#4c9f38' },
  { name: 'Quality Education', value: 71, goal: 80, color: '#c5192d' },
  { name: 'Gender Equality', value: 68, goal: 85, color: '#ff3a21' },
  { name: 'Clean Water', value: 76, goal: 90, color: '#26bde2' },
  { name: 'Affordable Energy', value: 91, goal: 85, color: '#fcc30b' },
  { name: 'Decent Work', value: 65, goal: 75, color: '#a21942' },
  { name: 'Industry & Innovation', value: 59, goal: 70, color: '#fd6925' },
  { name: 'Reduced Inequalities', value: 54, goal: 75, color: '#dd1367' },
  { name: 'Sustainable Cities', value: 73, goal: 80, color: '#fd9d24' },
  { name: 'Responsible Consumption', value: 85, goal: 80, color: '#bf8b2e' },
  { name: 'Climate Action', value: 95, goal: 90, color: '#3f7e44' },
  { name: 'Life Below Water', value: 67, goal: 75, color: '#0a97d9' },
  { name: 'Life on Land', value: 88, goal: 85, color: '#56c02b' },
  { name: 'Peace & Justice', value: 72, goal: 80, color: '#00689d' },
  { name: 'Partnerships', value: 81, goal: 85, color: '#19486a' }
];

// Sample data for emissions reduction
const emissionsData = [
  { year: '2020', actual: 1200, projected: 1200 },
  { year: '2021', actual: 950, projected: 1000 },
  { year: '2022', actual: 780, projected: 850 },
  { year: '2023', actual: 640, projected: 700 },
  { year: '2024', actual: 520, projected: 600 },
  { year: '2025', actual: null, projected: 500 },
  { year: '2026', actual: null, projected: 420 },
  { year: '2027', actual: null, projected: 350 },
  { year: '2028', actual: null, projected: 300 },
  { year: '2029', actual: null, projected: 250 },
  { year: '2030', actual: null, projected: 200 }
];

// Sample data for project categories impact
const categoriesImpactData = [
  { name: 'Renewable Energy', value: 35, color: '#0088FE' },
  { name: 'Forest Conservation', value: 25, color: '#00C49F' },
  { name: 'Sustainable Agriculture', value: 18, color: '#FFBB28' },
  { name: 'Waste Management', value: 12, color: '#FF8042' },
  { name: 'Energy Efficiency', value: 10, color: '#8884d8' }
];

// Sample data for monthly issuance
const monthlyIssuanceData = [
  { month: 'Jan', credits: 1200 },
  { month: 'Feb', credits: 1900 },
  { month: 'Mar', credits: 2100 },
  { month: 'Apr', credits: 1700 },
  { month: 'May', credits: 2400 },
  { month: 'Jun', credits: 2700 },
  { month: 'Jul', credits: 2300 },
  { month: 'Aug', credits: 3100 },
  { month: 'Sep', credits: 3500 },
  { month: 'Oct', credits: 3200 },
  { month: 'Nov', credits: 3800 },
  { month: 'Dec', credits: 4100 }
];

// Sample data for projects by region
const regionData = [
  { region: 'Africa', count: 42, emissions: 1200 },
  { region: 'Asia', count: 65, emissions: 2100 },
  { region: 'Europe', count: 38, emissions: 850 },
  { region: 'North America', count: 27, emissions: 920 },
  { region: 'South America', count: 53, emissions: 1800 },
  { region: 'Oceania', count: 15, emissions: 420 }
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('yearly');
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="container mx-auto py-6">
      <PageTitle 
        title="Advanced Analytics" 
        description="Comprehensive data visualization for carbon projects, SDG impacts, and emissions reduction forecasting" 
      />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Advanced Analytics
          </h1>
          <p className="text-neutral-600 mt-1">
            Data visualization and impact assessment for carbon projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/">
            <Button variant="outline" className="flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </a>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Last 30 Days</SelectItem>
              <SelectItem value="quarterly">Last Quarter</SelectItem>
              <SelectItem value="yearly">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sdg" className="flex items-center gap-1.5">
            <PieChartIcon className="w-4 h-4" />
            SDG Impacts
          </TabsTrigger>
          <TabsTrigger value="emissions" className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            Emissions Reduction
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-1.5">
            <Folder className="w-4 h-4" />
            Projects Analysis
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Emissions Reduction Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emissions Reduction Progress</CardTitle>
                <CardDescription>Actual vs projected CO2e reductions (tons)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={emissionsData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
                        </linearGradient>
                        <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) => [`${value} tons`, undefined]}
                        labelFormatter={(label) => `Year: ${label}`}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#8884d8" 
                        fillOpacity={1} 
                        fill="url(#colorActual)" 
                        name="Actual Reduction"
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="projected" 
                        stroke="#82ca9d" 
                        fillOpacity={1} 
                        fill="url(#colorProjected)" 
                        name="Projected Reduction"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* SDG Impact Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SDG Impact Highlights</CardTitle>
                <CardDescription>Performance against SDG targets (in %)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} data={sdgImpactData.slice(0, 8)}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Current Value"
                        dataKey="value"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Target"
                        dataKey="goal"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.15}
                        strokeDasharray="5 5"
                      />
                      <Legend />
                      <Tooltip formatter={(value: any) => `${value}%`} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Types Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Categories Impact</CardTitle>
                <CardDescription>Distribution of emissions reduction by project type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoriesImpactData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoriesImpactData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Monthly Issuance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Carbon Credits Issuance</CardTitle>
                <CardDescription>Monthly issuance of carbon credits (in tons)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyIssuanceData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`${value} tons`, 'Credits Issued']} />
                      <Bar 
                        dataKey="credits" 
                        fill="#5b67f8" 
                        radius={[4, 4, 0, 0]} 
                        name="Credits Issued"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* SDG Impacts Tab */}
        <TabsContent value="sdg">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sustainable Development Goals Impact</CardTitle>
              <CardDescription>
                Comprehensive visualization of project impacts across all 17 Sustainable Development Goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sdgImpactData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={150}
                      tick={{ fontSize: 12 }} 
                    />
                    <Tooltip formatter={(value: any) => `${value}%`} />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Current Value" 
                      stackId="a"
                      radius={[0, 4, 4, 0]}
                    >
                      {sdgImpactData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="goal" 
                      name="Target" 
                      stackId="b" 
                      fill="none" 
                      stroke="#000" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">4.2M+</div>
                  <div className="text-sm text-gray-600">People positively impacted</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">17</div>
                  <div className="text-sm text-gray-600">SDGs addressed across projects</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">85%</div>
                  <div className="text-sm text-gray-600">Average goal achievement rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SDG Impact Distribution</CardTitle>
                <CardDescription>Relative contribution to each SDG</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sdgImpactData.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {sdgImpactData.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `${value}%`} />
                      <Legend layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top SDG Performance</CardTitle>
                <CardDescription>Areas with highest impact and growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {sdgImpactData
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)
                    .map((sdg, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{sdg.name}</span>
                          <span className="text-sm font-medium">{sdg.value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full" 
                            style={{ 
                              width: `${sdg.value}%`, 
                              backgroundColor: sdg.color 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Goal: {sdg.goal}% | {sdg.value >= sdg.goal ? 'Exceeded' : `Gap: ${sdg.goal - sdg.value}%`}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Emissions Reduction Tab */}
        <TabsContent value="emissions">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Emissions Reduction Performance & Forecasting</CardTitle>
              <CardDescription>
                Historical emissions reduction with future projections and trend analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={emissionsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [`${value} tons`, undefined]}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#8884d8" 
                      name="Actual Reduction"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="projected" 
                      stroke="#82ca9d" 
                      name="Projected Reduction" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">4,090</div>
                  <div className="text-sm text-gray-600">Tons CO2e reduced to date</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">-56.7%</div>
                  <div className="text-sm text-gray-600">Reduction since baseline</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">8,310</div>
                  <div className="text-sm text-gray-600">Projected total by 2030</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Year-over-Year Progress</CardTitle>
                <CardDescription>Annual emissions reduction rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={emissionsData.slice(0, 5)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`${value} tons`, undefined]} />
                      <Legend />
                      <Bar dataKey="actual" name="Actual Reduction" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reduction Trajectory Analysis</CardTitle>
                <CardDescription>Annual rate of change and trend analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8 pt-2">
                  {/* Annual Rate Calculation */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold text-primary mb-2">Annual Reduction Rate</h3>
                    <div className="text-3xl font-bold text-slate-800">18.2%</div>
                    <p className="text-sm text-slate-600 mt-1">Average annual emissions reduction</p>
                    <div className="h-1 w-full bg-slate-200 mt-3">
                      <div className="h-1 bg-green-500" style={{ width: '78%' }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">78% of target reduction rate</p>
                  </div>
                  
                  {/* Projected Achievement */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-700 mb-2">2030 Target Achievement</h3>
                    <div className="text-3xl font-bold text-green-800">83.3%</div>
                    <p className="text-sm text-green-600 mt-1">Likelihood of meeting 2030 targets</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">On Track</span>
                      <span className="text-xs text-green-600">Based on current trajectory</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Projects Analysis Tab */}
        <TabsContent value="projects">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Projects by Region</CardTitle>
                <CardDescription>Geographical distribution of projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={regionData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Number of Projects" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emissions Reduction by Region</CardTitle>
                <CardDescription>Total emissions reduction (tons CO2e)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={regionData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`${value} tons`, undefined]} />
                      <Legend />
                      <Bar dataKey="emissions" name="CO2e Reduction" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Project Performance Metrics</CardTitle>
              <CardDescription>
                Key performance indicators across all projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Folder className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total Projects</div>
                      <div className="text-2xl font-bold">240</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Verified Projects</div>
                      <div className="text-2xl font-bold">197</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Landmark className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Participating Countries</div>
                      <div className="text-2xl font-bold">47</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-3 rounded-full">
                      <Calendar className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Avg. Project Duration</div>
                      <div className="text-2xl font-bold">7.2 yrs</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { year: '2019', projects: 65, verified: 45 },
                      { year: '2020', projects: 95, verified: 72 },
                      { year: '2021', projects: 140, verified: 105 },
                      { year: '2022', projects: 185, verified: 142 },
                      { year: '2023', projects: 220, verified: 178 },
                      { year: '2024', projects: 240, verified: 197 }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="projects" 
                      name="Total Projects" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="verified" 
                      name="Verified Projects" 
                      stroke="#82ca9d"
                      strokeWidth={2}
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}