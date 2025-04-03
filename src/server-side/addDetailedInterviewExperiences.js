import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/user.js';

// Initialize dotenv
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB for adding detailed interview experiences');
  addDetailedInterviewExperiences();
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});

// Function to add detailed interview experiences
const addDetailedInterviewExperiences = async () => {
  try {
    // Define Interview schema if it doesn't exist
    let Interview;
    try {
      // Try to get the model if it exists
      Interview = mongoose.model('InterviewExperience');
    } catch (error) {
      // If model doesn't exist, create it
      const interviewSchema = new mongoose.Schema({
        username: { type: String, required: true },
        companyName: { type: String, required: true },
        position: { type: String, required: true },
        experience: { type: String, required: true },
        interviewLevel: { type: String, required: true },
        result: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      });
      
      Interview = mongoose.model('InterviewExperience', interviewSchema);
      console.log('Created Interview Experience model');
    }
    
    // Delete existing interview experiences
    await Interview.deleteMany({});
    console.log('Cleared existing interview experiences');
    
    // Detailed interview experiences
    const detailedExperiences = [
      {
        username: 'Vikram Sen',
        companyName: 'Amazon',
        position: 'Security Engineer',
        interviewLevel: 'Easy',
        result: 'Successful',
        experience: `<p>Amazon's interview was challenging but fair. They wanted to see practical coding skills in AWS and problem-solving abilities.</p>

<p>The interview process consisted of 4 rounds:</p>

<p><strong>Round 1: Initial Technical Screening (45 minutes)</strong><br>
- Basic security concepts and AWS security services<br>
- Questions about IAM, security groups, and network ACLs<br>
- Simple coding challenge to identify security vulnerabilities</p>

<p><strong>Round 2: Deep Dive Technical (1 hour)</strong><br>
- Detailed discussion on security design patterns<br>
- Asked to design a secure microservices architecture<br>
- Questions about encryption, key management, and certificate handling<br>
- Specific scenarios involving S3 bucket security and Lambda function permissions</p>

<p><strong>Round 3: System Design (1 hour)</strong><br>
- Asked to design a secure authentication system with MFA<br>
- Discussion about scalability and security trade-offs<br>
- Focus on monitoring and alerting for security incidents<br>
- Error handling and recovery strategies for security breaches</p>

<p><strong>Round 4: Cultural Fit & Leadership Principles (45 minutes)</strong><br>
- Questions aligned with Amazon's leadership principles, especially "Security is Job Zero"<br>
- Scenarios about making security decisions under time constraints<br>
- Asked about my approach to promoting security culture in teams</p>

<p>Tips for others:</p>
<ul>
<li>Know AWS security services in depth</li>
<li>Practice explaining security concepts simply</li>
<li>Be ready with examples of how you've handled security incidents</li>
<li>Understand Amazon's leadership principles before interviewing</li>
</ul>

<p>Overall, it was a positive experience that tested both technical knowledge and practical application of security principles.</p>`
      },
      {
        username: 'Priya Mehta',
        companyName: 'Google',
        position: 'Software Engineer',
        interviewLevel: 'Difficult',
        result: 'Successful',
        experience: `<p>My Google interview journey was intense but rewarding. The entire process took about 6 weeks from initial contact to offer.</p>

<p><strong>Preparation (3 weeks):</strong><br>
I focused on algorithms, data structures, and system design using:
- LeetCode (100+ medium/hard problems)
- "Cracking the Coding Interview" book
- System Design Primer on GitHub
- Mock interviews with friends at other tech companies</p>

<p><strong>Round 1: Phone Screen (45 minutes)</strong><br>
- Two coding problems on a shared Google Doc
- First problem: String manipulation with dynamic programming
- Second problem: Graph traversal (modified BFS)
- Interviewer was friendly and gave subtle hints when I was stuck</p>

<p><strong>Onsite Interviews (5 rounds in one day):</strong></p>

<p><strong>Round 2: Coding (45 minutes)</strong><br>
- Problem involving tree traversal and optimization
- Had to write clean, efficient code with proper error handling
- Discussed time and space complexity in detail
- Optimized solution from O(n²) to O(n log n)</p>

<p><strong>Round 3: System Design (45 minutes)</strong><br>
- Design a distributed notification system
- Focused on scalability, reliability, and fault tolerance
- Discussed database choices, caching strategies, and load balancing
- Handled edge cases like message delivery guarantees and retry mechanisms</p>

<p><strong>Round 4: Coding + Algorithms (45 minutes)</strong><br>
- Problem involving dynamic programming and optimization
- Started with a brute force approach, then optimized
- Interviewer pushed on edge cases and performance
- Successfully implemented a solution using memoization</p>

<p><strong>Round 5: Behavioral (45 minutes)</strong><br>
- Questions about teamwork, conflict resolution, and leadership
- Discussed past projects and technical challenges
- Asked about how I handle ambiguity and prioritize tasks
- Connected my experiences to Google's culture and values</p>

<p><strong>Round 6: Team Fit (45 minutes)</strong><br>
- Technical discussion related to the specific team
- Deep dive into my background and interests
- Questions about Google technologies I've used
- Discussed potential projects I might work on</p>

<p><strong>Key Learnings:</strong></p>
<ul>
<li>Explaining your thought process is as important as the final solution</li>
<li>Don't be afraid to ask clarifying questions</li>
<li>Practice coding on a whiteboard or Google Doc without IDE assistance</li>
<li>Know your resume thoroughly - be prepared to dive deep on anything you've listed</li>
<li>Stay calm when stuck - interviewers want to see how you handle challenges</li>
</ul>

<p>One week after the onsite, my recruiter called with an offer. The process was well-organized, and while challenging, it gave me a good sense of the work and culture at Google.</p>`
      },
      {
        username: 'Raj Sharma',
        companyName: 'Microsoft',
        position: 'Frontend Engineer',
        interviewLevel: 'Medium',
        result: 'Successful',
        experience: `<p>I recently interviewed for a Frontend Engineer position at Microsoft, and I want to share my experience to help others prepare.</p>

<p><strong>Application Process:</strong><br>
I applied through Microsoft's careers website and heard back from a recruiter within 2 weeks. The entire process took about 5 weeks from application to offer.</p>

<p><strong>Round 1: Technical Screen (60 minutes)</strong><br>
- Started with a brief introduction
- Coding problem: Implement a debounce function from scratch
- Follow-up: Modify the implementation to support both immediate and delayed execution
- Questions about React lifecycle methods and state management
- Discussion about CSS layout techniques (Flexbox vs Grid)</p>

<p><strong>Round 2: Virtual Onsite (4 hours spread across a day)</strong></p>

<p><strong>Interview 1: Frontend Coding (60 minutes)</strong><br>
- Build a simple component that displays a list of items with filtering
- Implementation needed to handle edge cases like empty states and errors
- Focus on accessibility and semantic HTML
- Performance optimization questions
- Had to explain why I made certain architectural decisions</p>

<p><strong>Interview 2: JavaScript Fundamentals (60 minutes)</strong><br>
- Deep dive into closures, prototypes, and the event loop
- Implement a simple promise polyfill
- Questions about browser rendering pipeline
- Discussion about memory management in JavaScript
- Code review exercise where I had to identify and fix issues</p>

<p><strong>Interview 3: System Design (60 minutes)</strong><br>
- Design a real-time collaborative editor (similar to Google Docs)
- Focus on frontend architecture, state management, and data synchronization
- Discussion about handling conflicts and network latency
- Consideration for different devices and responsive design
- Questions about scalability and performance optimization</p>

<p><strong>Interview 4: Behavioral and Team Fit (60 minutes)</strong><br>
- Questions aligned with Microsoft's growth mindset culture
- Asked about handling feedback and learning from failures
- Discussion about working in diverse teams and resolving conflicts
- Questions about my approach to mentoring and knowledge sharing
- Scenarios about balancing quality vs. speed</p>

<p><strong>Key Observations:</strong></p>
<ul>
<li>Microsoft emphasized practical skills over algorithmic puzzles</li>
<li>Strong focus on fundamentals rather than framework-specific knowledge</li>
<li>Interviewers were genuinely interested in how I approached problems</li>
<li>Questions assessed both depth of technical knowledge and breadth of experience</li>
<li>Cultural fit was as important as technical ability</li>
</ul>

<p><strong>Preparation Tips:</strong></p>
<ul>
<li>Review JavaScript fundamentals thoroughly (closures, this, prototypes)</li>
<li>Practice building components from scratch without relying on libraries</li>
<li>Understand React's performance optimization techniques</li>
<li>Be ready to explain architectural decisions and trade-offs</li>
<li>Familiarize yourself with Microsoft's culture and values</li>
</ul>

<p>I received an offer a week after the final round. Overall, it was a fair and comprehensive process that tested both technical skills and problem-solving approach.</p>`
      },
      {
        username: 'Ananya Desai',
        companyName: 'Netflix',
        position: 'Senior Backend Engineer',
        interviewLevel: 'Difficult',
        result: 'Rejected',
        experience: `<p>I recently went through Netflix's interview process for a Senior Backend Engineer role. Although I didn't receive an offer, it was an insightful experience that helped me identify areas for improvement.</p>

<p><strong>Application:</strong><br>
I was referred by a current employee and received a response within a week to schedule the initial screen.</p>

<p><strong>Round 1: Technical Screen with Recruiter (30 minutes)</strong><br>
- Discussion about my background and experience
- Questions about microservices architecture and distributed systems
- Brief overview of Netflix's engineering culture and expectations
- They emphasized their culture of "freedom and responsibility"</p>

<p><strong>Round 2: Technical Phone Interview (60 minutes)</strong><br>
- Deep dive into my experience with high-scale systems
- Coding exercise: Design a rate limiter for an API
- Discussion about database scaling strategies
- Questions about handling failure scenarios in distributed systems
- I passed this round and was invited for the virtual onsite</p>

<p><strong>Round 3: Virtual Onsite (Full Day)</strong></p>

<p><strong>Interview 1: System Design (90 minutes)</strong><br>
- Asked to design Netflix's recommendation system
- Focus on data pipelines, real-time processing, and storage solutions
- Discussion about handling scale (millions of users, billions of events)
- Trade-offs between consistency and availability
- I thought this went well, with good discussion about design choices</p>

<p><strong>Interview 2: Coding and Algorithms (60 minutes)</strong><br>
- Problem: Implement a distributed cache with time-based eviction
- Had to handle concurrent access and race conditions
- Discussion about memory management and garbage collection
- This is where I struggled - my solution had a subtle concurrency bug that I couldn't identify within the time limit</p>

<p><strong>Interview 3: Technical Deep Dive (60 minutes)</strong><br>
- Detailed questions about my previous projects
- Asked to explain challenging problems I've solved
- Questions about JVM tuning and optimization
- Discussion about monitoring and observability
- I felt this went reasonably well, though I could have provided more detailed examples</p>

<p><strong>Interview 4: Culture Fit (45 minutes)</strong><br>
- Questions about handling ambiguity and making decisions with limited information
- Scenarios about prioritization and resource allocation
- Discussion about giving and receiving feedback
- Questions about my approach to continuous learning
- This seemed positive, with good rapport with the interviewer</p>

<p><strong>Where I Think I Fell Short:</strong></p>
<ul>
<li>The concurrency issues in the coding exercise were a significant factor</li>
<li>Could have demonstrated deeper knowledge of distributed systems failure modes</li>
<li>My system design solution focused too much on theoretical approaches rather than practical implementation</li>
<li>Needed more concrete examples of handling similar scale challenges</li>
</ul>

<p><strong>Feedback Received:</strong><br>
The recruiter provided feedback that while my background was impressive, they were looking for stronger hands-on experience with large-scale distributed systems. They also mentioned that the coding exercise revealed gaps in my understanding of concurrency patterns.</p>

<p><strong>What I'd Do Differently:</strong></p>
<ul>
<li>Practice more concurrent programming scenarios</li>
<li>Focus on practical implementation details in system design questions</li>
<li>Prepare more concrete examples from my experience</li>
<li>Better articulate trade-offs and decision-making processes</li>
</ul>

<p>Despite the rejection, I appreciate the thorough and professional interview process. It helped me identify areas to focus on for future opportunities.</p>`
      },
      {
        username: 'Sanjay Kumar',
        companyName: 'Meta',
        position: 'Data Engineer',
        interviewLevel: 'Medium',
        result: 'Waiting',
        experience: `<p>I recently interviewed for a Data Engineer position at Meta (formerly Facebook). The process was comprehensive and tested both technical skills and problem-solving approach.</p>

<p><strong>Preparation:</strong><br>
I spent about 4 weeks preparing, focusing on:
- SQL optimization and complex queries
- Python data processing
- Data modeling and schema design
- Distributed systems concepts
- Meta's data infrastructure (Presto, Hive, Spark)</p>

<p><strong>Round 1: Initial Technical Screen (45 minutes)</strong><br>
- Quick introduction and background discussion
- SQL problem: Write a query to analyze user engagement patterns
- Python problem: Implement a data transformation pipeline
- Questions about data quality and testing approaches
- The interviewer was friendly and offered guidance when needed</p>

<p><strong>Round 2: Virtual Onsite (4 interviews, 45 minutes each)</strong></p>

<p><strong>Interview 1: SQL and Data Modeling (45 minutes)</strong><br>
- Complex SQL problems involving multiple joins, window functions, and CTEs
- Schema design for a social media analytics system
- Questions about indexing strategies and query optimization
- Discussion about handling schema evolution and migrations
- I felt confident in this round, as SQL is one of my strengths</p>

<p><strong>Interview 2: Coding and Data Processing (45 minutes)</strong><br>
- Implement a data processing pipeline in Python
- Handle edge cases like missing data and schema inconsistencies
- Optimize for memory usage with large datasets
- Discussion about parallelization and distributed processing
- This went reasonably well, though I could have been more efficient with my solution</p>

<p><strong>Interview 3: System Design for Data Platforms (45 minutes)</strong><br>
- Design a real-time analytics dashboard for product metrics
- Focus on data ingestion, storage, processing, and visualization
- Discussion about latency requirements and trade-offs
- Handling scale (billions of events per day)
- Questions about failure modes and recovery strategies
- This was challenging but I believe I provided a solid architecture</p>

<p><strong>Interview 4: Behavioral and Problem Solving (45 minutes)</strong><br>
- Questions about past projects and technical challenges
- Scenarios about cross-functional collaboration
- Discussion about meta's values and culture fit
- Questions about my approach to learning new technologies
- How I handle ambiguity and changing requirements
- The conversation flowed well and I connected my experiences to Meta's environment</p>

<p><strong>Key Observations:</strong></p>
<ul>
<li>Strong emphasis on practical data engineering skills rather than theoretical knowledge</li>
<li>Focus on scale and efficiency in all solutions</li>
<li>Interest in how I approach problems methodically</li>
<li>Importance of communication and explaining technical concepts clearly</li>
<li>Questions designed to assess both depth and breadth of knowledge</li>
</ul>

<p><strong>The interview process concluded last week, and I'm currently waiting for the final decision. Regardless of the outcome, I found the process fair and well-structured.</strong></p>

<p><strong>Advice for Other Candidates:</strong></p>
<ul>
<li>Practice advanced SQL queries extensively</li>
<li>Be comfortable with Python data processing libraries (pandas, numpy)</li>
<li>Understand distributed data processing concepts</li>
<li>Prepare examples of how you've solved data engineering challenges</li>
<li>Research Meta's data infrastructure and common tools</li>
<li>Be ready to discuss trade-offs in your design decisions</li>
</ul>

<p>The interview process gave me good insight into Meta's data engineering practices and challenges. It was demanding but fair in assessing relevant skills for the role.</p>`
      },
      {
        username: 'Aditya Patel',
        companyName: 'Apple',
        position: 'iOS Developer',
        interviewLevel: 'Medium',
        result: 'Successful',
        experience: `<p>I recently went through Apple's interview process for an iOS Developer position. The entire process took about 6 weeks from initial contact to offer.</p>

<p><strong>Round 1: Recruiter Screen (30 minutes)</strong><br>
- Basic discussion about my background and iOS experience
- Questions about familiarity with Swift, UIKit, and SwiftUI
- Overview of Apple's interview process and team structure
- Very conversational and focused on assessing fit</p>

<p><strong>Round 2: Technical Phone Interview (60 minutes)</strong><br>
- Detailed discussion about my iOS experience and projects
- Coding challenge: Implement a custom UICollectionView layout
- Questions about memory management in iOS
- Discussion about app architecture patterns (MVC, MVVM, etc.)
- The interviewer was thorough but supportive</p>

<p><strong>Round 3: Take-home Project (Given 1 week to complete)</strong><br>
- Build a small iOS app that fetches and displays data from an API
- Requirements emphasized clean architecture, error handling, and UI polish
- I spent about 15 hours on this project
- Implemented MVVM architecture with Combine for reactive programming
- Added unit tests and UI tests to demonstrate testing approach
- Focused on accessibility and supporting different device sizes</p>

<p><strong>Round 4: Project Review and Technical Deep Dive (90 minutes)</strong><br>
- Walked through my take-home project with two engineers
- Explained architectural decisions and trade-offs
- Answered detailed questions about implementation choices
- Discussion about how I would scale the app for more features
- Questions about performance optimization and memory management
- This went well as I was able to justify my technical decisions</p>

<p><strong>Round 5: Panel Interview (Half-day)</strong></p>

<p><strong>Interview 1: iOS Fundamentals (60 minutes)</strong><br>
- Deep dive into UIKit and app lifecycle
- Questions about Core Data and persistence strategies
- Debugging scenarios with common iOS issues
- Discussion about handling background tasks and notifications
- This was challenging but I felt well-prepared</p>

<p><strong>Interview 2: System Design (60 minutes)</strong><br>
- Design a photo sharing app with social features
- Focus on client-server architecture and API design
- Questions about handling large media files efficiently
- Discussion about offline capabilities and sync mechanisms
- I thought this went well as I drew on my experience with similar apps</p>

<p><strong>Interview 3: Algorithm and Data Structures (45 minutes)</strong><br>
- Two medium-difficulty problems focused on:
  1. String manipulation with optimization
  2. Data structure design for caching with LRU eviction
- The interviewer was interested in my thought process
- I solved both problems with optimal solutions</p>

<p><strong>Interview 4: Behavioral and Culture Fit (45 minutes)</strong><br>
- Questions about collaboration and teamwork
- Scenarios about handling conflicting priorities
- Discussion about attention to detail and user focus
- Questions aligned with Apple's values
- Very conversational and positive</p>

<p><strong>Key Insights:</strong></p>
<ul>
<li>Apple places enormous emphasis on quality and user experience</li>
<li>Technical depth is important, but they equally value thoughtful design</li>
<li>Communication skills and ability to explain complex concepts clearly is crucial</li>
<li>They look for people who are passionate about creating exceptional products</li>
<li>Questions assess both technical skills and alignment with Apple's culture</li>
</ul>

<p><strong>Preparation Tips:</strong></p>
<ul>
<li>Master Swift language fundamentals and memory management</li>
<li>Understand iOS app architecture patterns deeply</li>
<li>Be prepared to explain and defend design decisions</li>
<li>Focus on clean, maintainable code rather than clever solutions</li>
<li>Practice explaining technical concepts in simple terms</li>
<li>Research Apple's design principles and development guidelines</li>
</ul>

<p>I received an offer one week after the panel interview. The process was thorough and gave me a good sense of Apple's engineering culture and expectations. While challenging, each step was fair and relevant to the actual job responsibilities.</p>`
      },
      {
        username: 'Neha Gupta',
        companyName: 'IBM',
        position: 'Machine Learning Engineer',
        interviewLevel: 'Difficult',
        result: 'Successful',
        experience: `<p>I recently interviewed for a Machine Learning Engineer position at IBM. The process was comprehensive and focused on both theoretical knowledge and practical implementation skills.</p>

<p><strong>Round 1: Initial Screening (45 minutes)</strong><br>
- Discussion about my background in machine learning and data science
- Questions about projects listed on my resume
- Brief overview of IBM's AI and ML initiatives
- Technical questions covering:
  * Basic ML algorithms (regression, classification, clustering)
  * Feature engineering techniques
  * Model evaluation metrics
  * Python and data processing libraries</p>

<p><strong>Round 2: Technical Assessment (2 hours)</strong><br>
This was a take-home assignment where I had to:
- Analyze a provided dataset with customer churn data
- Build and evaluate multiple ML models
- Implement feature engineering and selection
- Document my approach and findings
- Submit a Jupyter notebook with well-commented code

I spent approximately 10 hours on this assignment, focusing on thorough EDA, model experimentation, and clear documentation of my thought process.</p>

<p><strong>Round 3: Technical Deep Dive (1 hour)</strong><br>
- Detailed walkthrough of my technical assessment
- Questions about specific modeling choices I made
- Discussion about alternative approaches
- Deep dive into model interpretability techniques
- Questions about:
  * Handling imbalanced datasets
  * Feature importance and selection methods
  * Hyperparameter tuning strategies
  * Deployment considerations for ML models</p>

<p><strong>Round 4: Virtual Onsite (4 hours total)</strong></p>

<p><strong>Interview 1: Machine Learning Theory (60 minutes)</strong><br>
- Detailed questions about ML algorithms:
  * Mathematical foundations of neural networks
  * Gradient descent optimization techniques
  * Regularization methods and their effects
  * Loss functions and when to use each
- Whiteboarding exercise: Implement backpropagation for a simple neural network
- Discussion about recent ML research papers and trends
- This was the most challenging part, testing the depth of my theoretical knowledge</p>

<p><strong>Interview 2: Practical ML Implementation (60 minutes)</strong><br>
- Coding exercise: Build a text classification pipeline
- Focus on:
  * Data preprocessing for NLP
  * Feature extraction techniques
  * Model selection and evaluation
  * Handling performance issues with large text datasets
- Discussion about MLOps and model deployment
- Questions about monitoring ML models in production</p>

<p><strong>Interview 3: System Design for ML (60 minutes)</strong><br>
- Design an end-to-end system for real-time recommendation
- Considerations for:
  * Data ingestion and processing
  * Feature store architecture
  * Model training infrastructure
  * Serving infrastructure with latency requirements
  * A/B testing framework
- Discussion about scaling challenges and solutions</p>

<p><strong>Interview 4: Team and Cultural Fit (60 minutes)</strong><br>
- Questions about teamwork and collaboration
- Scenarios about working with cross-functional teams
- Discussion about IBM's values and culture
- Questions about my approach to continuous learning
- How I handle ambiguity and changing requirements</p>

<p><strong>Key Learnings:</strong></p>
<ul>
<li>IBM values both theoretical knowledge and practical experience</li>
<li>Strong emphasis on being able to explain complex concepts clearly</li>
<li>Focus on end-to-end ML systems, not just model building</li>
<li>Importance of considering business impact of ML solutions</li>
<li>Questions designed to test depth in specific areas and breadth across ML</li>
</ul>

<p><strong>Preparation Tips:</strong></p>
<ul>
<li>Review mathematical foundations of ML algorithms</li>
<li>Practice implementing models from scratch</li>
<li>Be familiar with the entire ML lifecycle from data to deployment</li>
<li>Understand MLOps best practices and challenges</li>
<li>Research IBM's AI ethics principles and approach</li>
<li>Prepare concrete examples of ML projects you've worked on</li>
</ul>

<p>I received an offer two weeks after the final round. The process was rigorous but fair, and gave me a good understanding of the role and expectations at IBM. Each interviewer was knowledgeable and professional, making the experience positive despite the technical depth required.</p>`
      }
    ];
    
    // Add the detailed interview experiences
    await Interview.insertMany(detailedExperiences);
    console.log(`Successfully added ${detailedExperiences.length} detailed interview experiences`);
    
    // Close connection
    mongoose.connection.close();
    console.log('Done! MongoDB connection closed.');
    
  } catch (error) {
    console.error('Error adding detailed interview experiences:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}; 