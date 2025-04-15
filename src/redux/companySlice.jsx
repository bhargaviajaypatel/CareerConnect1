import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const getCompanies = createAsyncThunk(
  "companies/getCompanies",
  async (payload, { rejectWithValue }) => {
    try {
      // Check if payload is valid
      if (!payload) {
        console.warn("Payload is undefined, returning empty array");
        return { companies: [] };
      }
      
      // Handle different payload types
      if (Array.isArray(payload)) {
        console.log("Payload is an array, using directly:", payload);
        return { companies: payload };
      } else if (payload.data && Array.isArray(payload.data)) {
        console.log("Payload has data array property, using payload.data:", payload.data);
        return { companies: payload.data };
      } else if (typeof payload === 'object') {
        console.log("Payload is an object, wrapping in array:", payload);
        return { companies: [payload] };
      } else {
        console.warn("Payload data is not in a recognized format:", payload);
        return { companies: [] };
      }
    } catch (error) {
      console.error("Error in getCompanies thunk:", error);
      return rejectWithValue(error.message);
    }
  }
);

const companySlice = createSlice({
  name: "companies",
 
  initialState: {
    companies: [],
    
  },
  reducers: {
    updateCompany:(state,action)=>{
        const index=state.companies.findIndex(x=>x.id===action.payload.id)
        state.companies[index]={
            id:action.payload.id,
            companyname:action.payload.companyname,
            jobprofile: action.payload.jobprofile,
            jobdescription: action.payload.jobdescription,
            website: action.payload.website,
            ctc: action.payload.ctc,
            doi: action.payload.doi,
            eligibilityCriteria: action.payload.eligibilityCriteria,
            tenthPercentage: action.payload.tenthPercentage,
            twelfthPercentage: action.payload.twelfthPercentage,
            graduationCGPA: action.payload.graduationCGPA,
            sixthSemesterCGPA: action.payload.sixthSemesterCGPA,
            requiredSkills: action.payload.requiredSkills || [],
            rolesAndResponsibilities: action.payload.rolesAndResponsibilities || []
        }


    },

    deleteCompany:(state,action)=>{
      const id=action.payload.id
      state.companies=state.companies.filter(u=>u.id!==id)
    },

    
  },
  extraReducers: (builder) => {
    builder.addCase(getCompanies.fulfilled, (state, action) => {
      state.companies = action.payload.companies.map(company => ({
        id: company._id,
        companyname: company.companyname,
        jobprofile: company.jobprofile,
        jobdescription: company.jobdescription,
        website: company.website,
        ctc: company.ctc,
        doi: company.doi,
        eligibilityCriteria: company.eligibilityCriteria,
        tenthPercentage: company.tenthPercentage,
        twelfthPercentage: company.twelfthPercentage,
        graduationCGPA: company.graduationCGPA,
        sixthSemesterCGPA: company.sixthSemesterCGPA,
        requiredSkills: company.requiredSkills || [],
        rolesAndResponsibilities: company.rolesAndResponsibilities || []
      }));
    });
  }
});

export const { updateCompany, deleteCompany} = companySlice.actions;
export default companySlice.reducer;
