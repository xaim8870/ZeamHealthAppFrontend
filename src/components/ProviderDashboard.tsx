
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, TrendingUp, AlertTriangle, Calendar } from "lucide-react";

interface ProviderDashboardProps {
  onBack: () => void;
}

const ProviderDashboard = ({ onBack }: ProviderDashboardProps) => {
  const mockPatients = [
    {
      id: 1,
      name: "John Smith",
      age: 34,
      lastSync: "2 hours ago",
      alerts: 1,
      metrics: {
        sleep: 78,
        activity: 65,
        mind: 72,
        body: 88
      }
    },
    {
      id: 2,
      name: "Emma Johnson",
      age: 28,
      lastSync: "1 hour ago",
      alerts: 0,
      metrics: {
        sleep: 92,
        activity: 85,
        mind: 89,
        body: 91
      }
    },
    {
      id: 3,
      name: "Michael Brown",
      age: 45,
      lastSync: "30 minutes ago",
      alerts: 2,
      metrics: {
        sleep: 45,
        activity: 32,
        mind: 41,
        body: 58
      }
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6 pt-4"
        >
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">Provider Dashboard</h1>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{mockPatients.length}</div>
              <div className="text-sm text-gray-600">Active Patients</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-500 mb-1">
                {mockPatients.reduce((sum, p) => sum + p.alerts, 0)}
              </div>
              <div className="text-sm text-gray-600">Active Alerts</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">85%</div>
              <div className="text-sm text-gray-600">Engagement Rate</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1">12</div>
              <div className="text-sm text-gray-600">Avg Sessions/Week</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Patient List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Patient Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPatients.map((patient) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * patient.id }}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-medium text-gray-800">{patient.name}</h3>
                          <p className="text-sm text-gray-600">Age {patient.age} • Last sync: {patient.lastSync}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {patient.alerts > 0 && (
                          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {patient.alerts} Alert{patient.alerts > 1 ? 's' : ''}
                          </Badge>
                        )}
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3">
                      {Object.entries(patient.metrics).map(([metric, score]) => (
                        <div key={metric} className="text-center">
                          <div className="text-xs text-gray-600 capitalize mb-1">{metric}</div>
                          <Badge className={getScoreBadge(score)}>
                            {score}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Tabs defaultValue="alerts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="alerts" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Active Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-800">Michael Brown - Sleep Quality</h4>
                          <p className="text-sm text-red-600">Sleep score below 50 for 3 consecutive days</p>
                        </div>
                        <Badge className="bg-red-100 text-red-800">High Priority</Badge>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-orange-800">John Smith - Activity Level</h4>
                          <p className="text-sm text-orange-600">Below target activity for this week</p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800">Medium Priority</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trends" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Population Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Trend analysis and charts would be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    Reports & Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Detailed reports and analytics would be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
