/**
 * TASK TEMPLATES COMPONENT - Pre-defined medical task templates
 * 
 * PURPOSE:
 * Provides a library of common medical task templates that can be
 * quickly applied to create standardized medical procedures.
 * 
 * KEY FEATURES:
 * 1. TEMPLATE LIBRARY
 *    - Common medical procedures
 *    - Species-specific templates
 *    - Customizable parameters
 * 
 * 2. TEMPLATE APPLICATION
 *    - One-click template application
 *    - Parameter customization
 *    - Bulk task creation
 * 
 * 3. TEMPLATE MANAGEMENT
 *    - Create custom templates
 *    - Edit existing templates
 *    - Template categorization
 * 
 * USER WORKFLOWS:
 * - Staff: Quickly create standard medical tasks
 * - Admin: Manage template library
 * - Veterinarian: Create specialized templates
 * 
 * TECHNICAL NOTES:
 * - Uses predefined template data
 * - Integrates with task creation forms
 * - Supports parameter substitution
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Stethoscope, Syringe, Scissors, Calendar, Clock } from "lucide-react";

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  species: string[];
  type: string;
  title: string;
  defaultDuration: number; // in days
  defaultCost: number;
  requiredFields: string[];
  parameters: {
    [key: string]: {
      type: 'text' | 'number' | 'select' | 'date';
      label: string;
      required: boolean;
      options?: string[];
      defaultValue?: any;
    };
  };
}

interface TaskTemplatesProps {
  onTemplateSelect: (template: TaskTemplate, parameters: any) => void;
  species?: string;
  className?: string;
}

// Predefined task templates
const taskTemplates: TaskTemplate[] = [
  {
    id: "annual-vaccination",
    name: "Annual Vaccination",
    description: "Complete annual vaccination protocol",
    category: "Vaccination",
    species: ["dog", "cat"],
    type: "vaccine",
    title: "Annual Vaccination - {animalName}",
    defaultDuration: 365,
    defaultCost: 75,
    requiredFields: ["vaccineType", "veterinarian"],
    parameters: {
      vaccineType: {
        type: "select",
        label: "Vaccine Type",
        required: true,
        options: ["DHPP", "Rabies", "Bordetella", "FVRCP"],
        defaultValue: "DHPP"
      },
      veterinarian: {
        type: "text",
        label: "Veterinarian",
        required: true,
        defaultValue: ""
      }
    }
  },
  {
    id: "spay-neuter",
    name: "Spay/Neuter Surgery",
    description: "Routine spay or neuter procedure",
    category: "Surgery",
    species: ["dog", "cat"],
    type: "surgery",
    title: "Spay/Neuter Surgery - {animalName}",
    defaultDuration: 14,
    defaultCost: 200,
    requiredFields: ["procedure", "anesthesiaType"],
    parameters: {
      procedure: {
        type: "select",
        label: "Procedure",
        required: true,
        options: ["Spay", "Neuter"],
        defaultValue: "Spay"
      },
      anesthesiaType: {
        type: "select",
        label: "Anesthesia",
        required: true,
        options: ["General", "Local"],
        defaultValue: "General"
      }
    }
  },
  {
    id: "health-checkup",
    name: "Health Checkup",
    description: "Routine health examination",
    category: "Examination",
    species: ["dog", "cat", "rabbit", "bird"],
    type: "exam",
    title: "Health Checkup - {animalName}",
    defaultDuration: 30,
    defaultCost: 50,
    requiredFields: ["examType"],
    parameters: {
      examType: {
        type: "select",
        label: "Exam Type",
        required: true,
        options: ["Routine", "Pre-adoption", "Follow-up", "Emergency"],
        defaultValue: "Routine"
      }
    }
  },
  {
    id: "dental-cleaning",
    name: "Dental Cleaning",
    description: "Professional dental cleaning and examination",
    category: "Dental",
    species: ["dog", "cat"],
    type: "treatment",
    title: "Dental Cleaning - {animalName}",
    defaultDuration: 7,
    defaultCost: 150,
    requiredFields: ["anesthesiaRequired"],
    parameters: {
      anesthesiaRequired: {
        type: "select",
        label: "Anesthesia Required",
        required: true,
        options: ["Yes", "No"],
        defaultValue: "Yes"
      }
    }
  },
  {
    id: "microchip-implant",
    name: "Microchip Implant",
    description: "Implant microchip for identification",
    category: "Identification",
    species: ["dog", "cat"],
    type: "treatment",
    title: "Microchip Implant - {animalName}",
    defaultDuration: 1,
    defaultCost: 25,
    requiredFields: ["microchipNumber"],
    parameters: {
      microchipNumber: {
        type: "text",
        label: "Microchip Number",
        required: true,
        defaultValue: ""
      }
    }
  }
];

export default function TaskTemplates({ 
  onTemplateSelect, 
  species = "all",
  className = ""
}: TaskTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [parameters, setParameters] = useState<{[key: string]: any}>({});
  const [showParameters, setShowParameters] = useState(false);

  // ============================================================================
  // TEMPLATE FILTERING - Filter templates by species and category
  // ============================================================================

  const getFilteredTemplates = () => {
    return taskTemplates.filter(template => {
      if (species !== "all" && !template.species.includes(species)) {
        return false;
      }
      return true;
    });
  };

  const filteredTemplates = getFilteredTemplates();

  // ============================================================================
  // TEMPLATE HANDLING - Select and configure templates
  // ============================================================================

  const handleTemplateSelect = (template: TaskTemplate) => {
    setSelectedTemplate(template);
    setShowParameters(true);
    
    // Initialize parameters with default values
    const initialParams: {[key: string]: any} = {};
    Object.entries(template.parameters).forEach(([key, param]) => {
      initialParams[key] = param.defaultValue || "";
    });
    setParameters(initialParams);
  };

  const handleParameterChange = (key: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate, parameters);
      setSelectedTemplate(null);
      setShowParameters(false);
      setParameters({});
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Vaccination":
        return <Syringe className="w-4 h-4" />;
      case "Surgery":
        return <Scissors className="w-4 h-4" />;
      case "Examination":
        return <Stethoscope className="w-4 h-4" />;
      case "Dental":
        return <Stethoscope className="w-4 h-4" />;
      case "Identification":
        return <Calendar className="w-4 h-4" />;
      default:
        return <Stethoscope className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Vaccination":
        return "bg-blue-100 text-blue-800";
      case "Surgery":
        return "bg-red-100 text-red-800";
      case "Examination":
        return "bg-green-100 text-green-800";
      case "Dental":
        return "bg-purple-100 text-purple-800";
      case "Identification":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Template Library */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleTemplateSelect(template)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {template.name}
                </CardTitle>
                <Badge className={getCategoryColor(template.category)}>
                  {getCategoryIcon(template.category)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground mb-2">
                {template.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{template.defaultDuration}d</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>${template.defaultCost}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Parameters */}
      {showParameters && selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Configure {selectedTemplate.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(selectedTemplate.parameters).map(([key, param]) => (
              <div key={key}>
                <Label htmlFor={key} className="text-sm">
                  {param.label} {param.required && <span className="text-destructive">*</span>}
                </Label>
                
                {param.type === "select" ? (
                  <Select
                    value={parameters[key] || ""}
                    onValueChange={(value) => handleParameterChange(key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${param.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {param.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={key}
                    type={param.type === "number" ? "number" : "text"}
                    value={parameters[key] || ""}
                    onChange={(e) => handleParameterChange(key, e.target.value)}
                    placeholder={`Enter ${param.label}`}
                  />
                )}
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <Button onClick={handleApplyTemplate} className="flex-1">
                Apply Template
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowParameters(false);
                  setSelectedTemplate(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
