import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, PieChart, Download, Filter, Calendar, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";

interface PerformanceMetric {
  name: string;
  value: number;
  previous?: number;
}

interface PerformanceAnalyticsProps {
  metrics: PerformanceMetric[];
  reports: any[];
  onDownloadReport: (reportId: string) => void;
}

export function PerformanceAnalytics({ metrics, reports, onDownloadReport }: PerformanceAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("month");
  const [selectedMetric, setSelectedMetric] = useState("overall");

  const getTrendIcon = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = current - previous;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <span className="text-gray-400">—</span>;
  };

  const calculateChange = (current: number, previous?: number) => {
    if (!previous) return "—";
    const change = current - previous;
    const percentage = Math.round((change / previous) * 100);
    return `${change > 0 ? "+" : ""}${percentage}%`;
  };

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 90 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <div key={metric.name} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{metric.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}%</p>
                  </div>
                  {getTrendIcon(metric.value, metric.previous)}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">vs previous period</p>
                  <span className={`text-xs font-medium ${metric.previous && metric.value > metric.previous ? "text-green-600" : "text-red-600"}`}>
                    {calculateChange(metric.value, metric.previous)}
                  </span>
                </div>
                <Progress value={metric.value} className="h-2 mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Score Progression</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <BarChart className="w-4 h-4 mr-1" />
                Bar Chart
              </Button>
              <Button variant="outline" size="sm">
                <LineChart className="w-4 h-4 mr-1" />
                Line Chart
              </Button>
            </div>
          </div>

          {/* Chart Placeholder - In a real app, this would be a chart library */}
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="flex justify-center items-end gap-4 h-48">
              {[75, 82, 78, 85, 90, 88].map((value, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-8 bg-indigo-600 rounded-t-md"
                    style={{ height: `${value}px` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-1">Week {index + 1}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">Interview scores over time</p>
          </div>
        </CardContent>
      </Card>

      {/* Skill Breakdown */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Skill Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Strengths</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Technical Knowledge</p>
                    <p className="text-sm text-gray-600">Strong understanding of core concepts</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Problem Solving</p>
                    <p className="text-sm text-gray-600">Effective approach to complex problems</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-4">Areas for Improvement</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Time Management</p>
                    <p className="text-sm text-gray-600">Practice more concise responses</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Behavioral Questions</p>
                    <p className="text-sm text-gray-600">Use STAR method more consistently</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interview Reports */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Interview Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-indigo-600">
                      {report.company.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {report.company} - {report.role}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(report.date).toLocaleDateString()} • {report.score}% Score
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => onDownloadReport(report.id)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}