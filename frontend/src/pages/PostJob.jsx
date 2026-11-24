
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Briefcase, Send } from "lucide-react";

function PostJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    job_title: "",
    company_name: "",
    location: "",
    employment_type: "Full-time",
    description: ""
  });

  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch available skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/jobs/skills"
        );

        const data = response.data.skills || response.data;
        setSkills(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Unable to load available skills.");
      }
    };

    fetchSkills();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSkillChange = (skillId) => {
    setSelectedSkills((previous) =>
      previous.includes(skillId)
        ? previous.filter((id) => id !== skillId)
        : [...previous, skillId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (selectedSkills.length === 0) {
      setError("Please select at least one required skill.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // Create job
      const jobResponse = await axios.post(
        "http://localhost:5000/api/jobs",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const createdJob =
        jobResponse.data.job ||
        jobResponse.data;

      const jobId =
        createdJob.job_id ||
        createdJob.id;

      if (!jobId) {
        throw new Error(
          "Job was created, but the job ID was not returned."
        );
      }

      // Attach selected skills
      await axios.post(
        `http://localhost:5000/api/jobs/${jobId}/skills`,
        {
          skill_ids: selectedSkills
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess("Job posted successfully!");

      setFormData({
        job_title: "",
        company_name: "",
        location: "",
        employment_type: "Full-time",
        description: ""
      });

      setSelectedSkills([]);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to post job."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page alumni-post-job-redesign">

      <header className="dashboard-header">
        <div>
          <h1>Post a Job</h1>
          <p>Share opportunities with Sahyadri students</p>
        </div>

        <button
          onClick={() => navigate("/dashboard/alumni")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>
      </header>

      <main className="dashboard-content">

        <div className="post-job-container">

          <div className="post-job-heading">
            <Briefcase size={28} />
            <h2>Job Details</h2>
          </div>

          {error && (
            <p className="form-error">{error}</p>
          )}

          {success && (
            <p className="form-success">{success}</p>
          )}

          <form onSubmit={handleSubmit}>

            <label>Job Title</label>
            <input
              type="text"
              name="job_title"
              placeholder="Enter job title"
              value={formData.job_title}
              onChange={handleChange}
              required
            />

            <label>Company Name</label>
            <input
              type="text"
              name="company_name"
              placeholder="Enter company name"
              value={formData.company_name}
              onChange={handleChange}
              required
            />

            <label>Job Location</label>
            <input
              type="text"
              name="location"
              placeholder="Enter job location"
              value={formData.location}
              onChange={handleChange}
              required
            />

            <label>Employment Type</label>
            <select
              name="employment_type"
              value={formData.employment_type}
              onChange={handleChange}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>

            <label>Job Description</label>
            <textarea
              name="description"
              placeholder="Describe the job role and responsibilities"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
            />

            <label>Required Skills</label>

            <div className="post-job-skills">
              {skills.map((skill) => (
                <label
                  className="skill-checkbox"
                  key={skill.skill_id}
                >
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(
                      skill.skill_id
                    )}
                    onChange={() =>
                      handleSkillChange(skill.skill_id)
                    }
                  />

                  {skill.skill_name}
                </label>
              ))}
            </div>

            <button
              type="submit"
              className="submit-job-button"
              disabled={loading}
            >
              <Send size={18} />
              {loading ? "Posting Job..." : "Post Job"}
            </button>

          </form>

        </div>

      </main>
    </div>
  );
}

export default PostJob;
