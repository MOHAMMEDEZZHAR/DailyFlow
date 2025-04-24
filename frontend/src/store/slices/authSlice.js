import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

const tokenKey = 'dailyflow_token';

export const login = createAsyncThunk('auth/login', async (payload, thunkAPI) => {
  try {
    const res = await axios.post('/auth/login', payload);
    localStorage.setItem(tokenKey, res.data.token);
    return res.data.token;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Erreur serveur');
  }
});

export const register = createAsyncThunk('auth/register', async (payload, thunkAPI) => {
  try {
    const res = await axios.post('/auth/register', payload);
    localStorage.setItem(tokenKey, res.data.token);
    return res.data.token;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Erreur serveur');
  }
});

const initialState = {
  token: localStorage.getItem(tokenKey),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      localStorage.removeItem(tokenKey);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
