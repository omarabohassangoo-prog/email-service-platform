import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  html: string;
  version: number;
}

export interface TemplateState {
  templates: EmailTemplate[];
  selectedTemplate: EmailTemplate | null;
  loading: boolean;
}

const initialState: TemplateState = {
  templates: [
    {
      id: 'welcome_email',
      name: 'welcome_email',
      subject: 'مرحباً بك {{userName}} في المنصة!',
      category: 'onboarding',
      html: '<div style="font-family: sans-serif; padding: 20px;"><h1>أهلاً بك {{userName}}</h1><p>رابط التفعيل: <a href="{{activationUrl}}">اضغط هنا</a></p></div>',
      version: 1
    },
    {
      id: 'password_reset',
      name: 'password_reset',
      subject: 'طلب إعادة ضبط كلمة المرور',
      category: 'security',
      html: '<div style="font-family: sans-serif;"><h2>إعادة الضبط</h2><p>رمز التحقق الخارجي: <strong>{{code}}</strong></p></div>',
      version: 2
    }
  ],
  selectedTemplate: null,
  loading: false
};

export const templateSlice = createSlice({
  name: 'template',
  initialState,
  reducers: {
    setTemplates: (state, action: PayloadAction<EmailTemplate[]>) => {
      state.templates = action.payload;
    },
    addTemplate: (state, action: PayloadAction<EmailTemplate>) => {
      state.templates.push(action.payload);
    },
    selectTemplate: (state, action: PayloadAction<EmailTemplate | null>) => {
      state.selectedTemplate = action.payload;
    }
  }
});

export const { setTemplates, addTemplate, selectTemplate } = templateSlice.actions;
export default templateSlice.reducer;
