import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Heart, Activity, ChevronRight, ChevronLeft, 
  Check, Calculator, ArrowRight
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface FormData {
  age: number;
  gender: string;
  height: number;
  weight: number;
  bloodPressure: string;
  familyHistory: string;
  dietQuality: number;
  physicalActivity: number;
}

const steps = [
  { id: 1, title: "Demographics", icon: User, description: "Basic information" },
  { id: 2, title: "Vitals", icon: Heart, description: "Health metrics" },
  { id: 3, title: "Lifestyle", icon: Activity, description: "Daily habits" },
];

const Assessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    age: 35,
    gender: "",
    height: 170,
    weight: 70,
    bloodPressure: "",
    familyHistory: "",
    dietQuality: 5,
    physicalActivity: 5,
  });

  const calculateBMI = () => {
    const heightM = formData.height / 100;
    return (formData.weight / (heightM * heightM)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-yellow-500" };
    if (bmi < 25) return { label: "Normal", color: "text-risk-low" };
    if (bmi < 30) return { label: "Overweight", color: "text-risk-moderate" };
    return { label: "Obese", color: "text-risk-high" };
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate risk and navigate to results
      navigate("/results", { 
        state: { 
          formData,
          bmi: calculateBMI()
        } 
      });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const bmi = parseFloat(calculateBMI());
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Risk <span className="text-gradient-primary">Assessment</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Answer a few questions to help our AI analyze your diabetes risk. 
              This takes about 2 minutes.
            </p>
          </motion.div>

          {/* Stepper */}
          <div className="mb-12">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                        currentStep >= step.id
                          ? "gradient-primary text-primary-foreground shadow-glow"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-sm font-medium hidden sm:block",
                        currentStep >= step.id
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-16 md:w-24 h-1 mx-2 rounded-full transition-colors",
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-card rounded-3xl shadow-lg border border-border/50 p-8 md:p-12"
          >
            <AnimatePresence mode="wait">
              {/* Step 1: Demographics */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Demographics</h2>
                    <p className="text-muted-foreground">Tell us about yourself</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label>Age</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[formData.age]}
                          onValueChange={(value) =>
                            setFormData({ ...formData, age: value[0] })
                          }
                          min={18}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-2xl font-bold text-primary w-16 text-right">
                          {formData.age}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">years old</p>
                    </div>

                    <div className="space-y-3">
                      <Label>Gender</Label>
                      <RadioGroup
                        value={formData.gender}
                        onValueChange={(value) =>
                          setFormData({ ...formData, gender: value })
                        }
                        className="grid grid-cols-2 gap-3"
                      >
                        {["Male", "Female"].map((gender) => (
                          <Label
                            key={gender}
                            htmlFor={gender}
                            className={cn(
                              "flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all",
                              formData.gender === gender
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <RadioGroupItem
                              value={gender}
                              id={gender}
                              className="sr-only"
                            />
                            <span className="font-medium">{gender}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Vitals */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Health Vitals</h2>
                    <p className="text-muted-foreground">Your physical measurements</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) =>
                          setFormData({ ...formData, height: Number(e.target.value) })
                        }
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData({ ...formData, weight: Number(e.target.value) })
                        }
                        className="h-12"
                      />
                    </div>
                  </div>

                  {/* BMI Calculator */}
                  <div className="bg-muted/50 rounded-2xl p-6 border border-border/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Calculator className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Calculated BMI</p>
                        <p className="text-2xl font-bold">{calculateBMI()}</p>
                      </div>
                    </div>
                    <p className={cn("text-sm font-medium", bmiCategory.color)}>
                      {bmiCategory.label}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Blood Pressure History</Label>
                    <RadioGroup
                      value={formData.bloodPressure}
                      onValueChange={(value) =>
                        setFormData({ ...formData, bloodPressure: value })
                      }
                      className="grid grid-cols-1 md:grid-cols-3 gap-3"
                    >
                      {["Normal", "Elevated", "High"].map((bp) => (
                        <Label
                          key={bp}
                          htmlFor={`bp-${bp}`}
                          className={cn(
                            "flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all",
                            formData.bloodPressure === bp
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <RadioGroupItem
                            value={bp}
                            id={`bp-${bp}`}
                            className="sr-only"
                          />
                          <span className="font-medium">{bp}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Lifestyle */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Lifestyle Factors</h2>
                    <p className="text-muted-foreground">Your daily habits and history</p>
                  </div>

                  <div className="space-y-3">
                    <Label>Family History of Diabetes</Label>
                    <RadioGroup
                      value={formData.familyHistory}
                      onValueChange={(value) =>
                        setFormData({ ...formData, familyHistory: value })
                      }
                      className="grid grid-cols-1 md:grid-cols-3 gap-3"
                    >
                      {["None", "Parent or Sibling", "Grandparent"].map((history) => (
                        <Label
                          key={history}
                          htmlFor={`history-${history}`}
                          className={cn(
                            "flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all text-center",
                            formData.familyHistory === history
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <RadioGroupItem
                            value={history}
                            id={`history-${history}`}
                            className="sr-only"
                          />
                          <span className="font-medium">{history}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Diet Quality</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      How would you rate your overall diet? (1 = Poor, 10 = Excellent)
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Poor</span>
                      <Slider
                        value={[formData.dietQuality]}
                        onValueChange={(value) =>
                          setFormData({ ...formData, dietQuality: value[0] })
                        }
                        min={1}
                        max={10}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">Excellent</span>
                    </div>
                    <p className="text-center text-2xl font-bold text-primary">
                      {formData.dietQuality}/10
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Physical Activity Level</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      How active are you weekly? (1 = Sedentary, 10 = Very Active)
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Low</span>
                      <Slider
                        value={[formData.physicalActivity]}
                        onValueChange={(value) =>
                          setFormData({ ...formData, physicalActivity: value[0] })
                        }
                        min={1}
                        max={10}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">High</span>
                    </div>
                    <p className="text-center text-2xl font-bold text-secondary">
                      {formData.physicalActivity}/10
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-10 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button variant="hero" onClick={handleNext}>
                {currentStep === 3 ? (
                  <>
                    Get Results
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Assessment;
