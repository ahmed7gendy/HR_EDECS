import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    common: {
      dashboard: 'Dashboard',
      employees: 'Employees',
      companies: 'Companies',
      workflows: 'Workflows',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      actions: 'Actions',
    },
    auth: {
      loginTitle: 'Login to your account',
      registerTitle: 'Create new account',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      passwordResetSent: 'Password reset email sent',
      invalidCredentials: 'Invalid email or password',
      emailExists: 'Email already exists',
      weakPassword: 'Password is too weak',
      passwordMismatch: 'Passwords do not match',
    },
    validation: {
      required: 'This field is required',
      email: 'Invalid email address',
      minLength: 'Must be at least {min} characters',
      maxLength: 'Must be at most {max} characters',
      passwordMatch: 'Passwords must match',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Customize your application settings',
      logoSettings: 'Logo Settings',
      currentLogo: 'Current Logo',
      chooseLogo: 'Choose Logo',
      dragDropLogo: 'Drag and drop your logo here or click to select',
      logoInvalidType: 'Please upload an image file',
      logoTooLarge: 'Logo file size must be less than 2MB',
      logoUploadError: 'Error uploading logo. Please try again.',
      logoUpdateSuccess: 'Logo updated successfully',
      logoRequirements: 'Recommended size: 200x200px. Maximum file size: 2MB. Supported formats: PNG, JPG, SVG',
    },
    employees: {
      title: 'Employees',
      addNew: 'Add Employee',
      name: 'Name',
      email: 'Email',
      department: 'Department',
      position: 'Position',
      status: {
        all: 'All Status',
        active: 'Active',
        inactive: 'Inactive'
      },
      deleteConfirmTitle: 'Delete Employee',
      deleteConfirmMessage: 'Are you sure you want to delete {name}? This action cannot be undone.'
    },
    companies: {
      title: 'Companies',
      addNew: 'Add Company',
      name: 'Company Name',
      industry: 'Industry',
      employees: 'Employees',
      email: 'Company Email',
      phone: 'Phone Number',
      website: 'Website',
      address: 'Address',
      description: 'Description',
      status: {
        title: 'Status',
        all: 'All Status',
        active: 'Active',
        inactive: 'Inactive'
      },
      details: 'Company Details',
      recentEmployees: 'Recent Employees',
      noEmployees: 'No employees found',
      deleteConfirmTitle: 'Delete Company',
      deleteConfirmMessage: 'Are you sure you want to delete {name}? This action cannot be undone.',
      fetchError: 'Failed to fetch companies',
      deleteError: 'Failed to delete company',
      deleteSuccess: 'Company deleted successfully',
      saveError: 'Failed to save company',
      saveSuccess: 'Company saved successfully',
      edit: 'Edit Company'
    },
    workflows: {
      title: 'Workflows',
      addNew: 'Add Workflow',
      name: 'Workflow Name',
      type: 'Type',
      description: 'Description',
      progress: 'Progress',
      steps: 'Steps',
      assignees: 'Assignees',
      dueDate: 'Due Date',
      createdAt: 'Created At',
      updatedAt: 'Updated At',
      details: 'Workflow Details',
      status: {
        title: 'Status',
        all: 'All Status',
        active: 'Active',
        draft: 'Draft',
        completed: 'Completed',
        cancelled: 'Cancelled'
      },
      types: {
        approval: 'Approval',
        review: 'Review',
        onboarding: 'Onboarding',
        offboarding: 'Offboarding',
        custom: 'Custom'
      },
      deleteConfirmTitle: 'Delete Workflow',
      deleteConfirmMessage: 'Are you sure you want to delete {name}? This action cannot be undone.',
      fetchError: 'Failed to fetch workflows',
      deleteError: 'Failed to delete workflow',
      deleteSuccess: 'Workflow deleted successfully',
      saveError: 'Failed to save workflow',
      saveSuccess: 'Workflow saved successfully',
      edit: 'Edit Workflow',
      stepStatus: {
        pending: 'Pending',
        inProgress: 'In Progress',
        completed: 'Completed',
        rejected: 'Rejected'
      },
      addStep: 'Add Step',
      editStep: 'Edit Step',
      deleteStep: 'Delete Step',
      stepName: 'Step Name',
      stepDescription: 'Step Description',
      stepAssignees: 'Step Assignees',
      stepDueDate: 'Step Due Date',
      stepOrder: 'Step Order',
      moveStepUp: 'Move Step Up',
      moveStepDown: 'Move Step Down',
      noSteps: 'No steps added yet',
      addFirstStep: 'Add your first step'
    },
    departments: 'Departments',
    add_department: 'Add Department',
    edit_department: 'Edit Department',
    department_name: 'Department Name',
    department_code: 'Department Code',
    description: 'Description',
    manager: 'Manager',
    no_manager: 'No Manager',
    budget_amount: 'Budget Amount',
    currency: 'Currency',
    fiscal_year: 'Fiscal Year',
    department_goals: 'Department Goals',
    goal_title: 'Goal Title',
    goal_description: 'Goal Description',
    add_goal: 'Add Goal',
    error_loading_department: 'Error loading department data',
    error_saving_department: 'Error saving department',
    department_saved: 'Department saved successfully',
    department_deleted: 'Department deleted successfully',
    confirm_delete_department: 'Are you sure you want to delete this department?',
    department_has_employees: 'This department has employees assigned to it. Please reassign them before deleting.',
  },
  ar: {
    common: {
      dashboard: 'لوحة التحكم',
      employees: 'الموظفين',
      companies: 'الشركات',
      workflows: 'سير العمل',
      settings: 'الإعدادات',
      profile: 'الملف الشخصي',
      logout: 'تسجيل الخروج',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      firstName: 'الاسم الأول',
      lastName: 'الاسم الأخير',
      submit: 'إرسال',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      view: 'عرض',
      search: 'بحث',
      filter: 'تصفية',
      sort: 'ترتيب',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجاح',
      warning: 'تحذير',
      info: 'معلومات',
      actions: 'إجراءات',
    },
    auth: {
      loginTitle: 'تسجيل الدخول إلى حسابك',
      registerTitle: 'إنشاء حساب جديد',
      forgotPassword: 'نسيت كلمة المرور؟',
      resetPassword: 'إعادة تعيين كلمة المرور',
      passwordResetSent: 'تم إرسال بريد إعادة تعيين كلمة المرور',
      invalidCredentials: 'بريد إلكتروني أو كلمة مرور غير صحيحة',
      emailExists: 'البريد الإلكتروني موجود بالفعل',
      weakPassword: 'كلمة المرور ضعيفة جداً',
      passwordMismatch: 'كلمات المرور غير متطابقة',
    },
    validation: {
      required: 'هذا الحقل مطلوب',
      email: 'عنوان بريد إلكتروني غير صالح',
      minLength: 'يجب أن يكون على الأقل {min} أحرف',
      maxLength: 'يجب أن يكون على الأكثر {max} أحرف',
      passwordMatch: 'يجب أن تتطابق كلمات المرور',
    },
    settings: {
      title: 'الإعدادات',
      subtitle: 'تخصيص إعدادات التطبيق',
      logoSettings: 'إعدادات الشعار',
      currentLogo: 'الشعار الحالي',
      chooseLogo: 'اختر الشعار',
      dragDropLogo: 'اسحب وأفلت الشعار هنا أو انقر للاختيار',
      logoInvalidType: 'يرجى تحميل ملف صورة',
      logoTooLarge: 'يجب أن يكون حجم ملف الشعار أقل من 2 ميجابايت',
      logoUploadError: 'خطأ في تحميل الشعار. حاول مرة أخرى.',
      logoUpdateSuccess: 'تم تحديث الشعار بنجاح',
      logoRequirements: 'الحجم الموصى به: 200×200 بكسل. الحد الأقصى لحجم الملف: 2 ميجابايت. الصيغ المدعومة: PNG، JPG، SVG',
    },
    employees: {
      title: 'الموظفون',
      addNew: 'إضافة موظف',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      department: 'القسم',
      position: 'المنصب',
      status: {
        all: 'جميع الحالات',
        active: 'نشط',
        inactive: 'غير نشط'
      },
      deleteConfirmTitle: 'حذف موظف',
      deleteConfirmMessage: 'هل أنت متأكد من حذف {name}؟ لا يمكن التراجع عن هذا الإجراء.'
    },
    companies: {
      title: 'الشركات',
      addNew: 'إضافة شركة',
      name: 'اسم الشركة',
      industry: 'الصناعة',
      employees: 'الموظفون',
      email: 'البريد الإلكتروني للشركة',
      phone: 'رقم الهاتف',
      website: 'الموقع الإلكتروني',
      address: 'العنوان',
      description: 'الوصف',
      status: {
        title: 'الحالة',
        all: 'جميع الحالات',
        active: 'نشطة',
        inactive: 'غير نشطة'
      },
      details: 'تفاصيل الشركة',
      recentEmployees: 'الموظفون الحاليون',
      noEmployees: 'لا يوجد موظفون',
      deleteConfirmTitle: 'حذف شركة',
      deleteConfirmMessage: 'هل أنت متأكد من حذف {name}؟ لا يمكن التراجع عن هذا الإجراء.',
      fetchError: 'فشل في جلب الشركات',
      deleteError: 'فشل في حذف الشركة',
      deleteSuccess: 'تم حذف الشركة بنجاح',
      saveError: 'فشل في حفظ الشركة',
      saveSuccess: 'تم حفظ الشركة بنجاح',
      edit: 'تعديل الشركة'
    },
    workflows: {
      title: 'سير العمل',
      addNew: 'إضافة سير عمل',
      name: 'اسم سير العمل',
      type: 'النوع',
      description: 'الوصف',
      progress: 'التقدم',
      steps: 'الخطوات',
      assignees: 'المعينون',
      dueDate: 'تاريخ الاستحقاق',
      createdAt: 'تاريخ الإنشاء',
      updatedAt: 'تاريخ التحديث',
      details: 'تفاصيل سير العمل',
      status: {
        title: 'الحالة',
        all: 'جميع الحالات',
        active: 'نشط',
        draft: 'مسودة',
        completed: 'مكتمل',
        cancelled: 'ملغي'
      },
      types: {
        approval: 'موافقة',
        review: 'مراجعة',
        onboarding: 'تعيين',
        offboarding: 'إنهاء خدمة',
        custom: 'مخصص'
      },
      deleteConfirmTitle: 'حذف سير العمل',
      deleteConfirmMessage: 'هل أنت متأكد من حذف {name}؟ لا يمكن التراجع عن هذا الإجراء.',
      fetchError: 'فشل في جلب سير العمل',
      deleteError: 'فشل في حذف سير العمل',
      deleteSuccess: 'تم حذف سير العمل بنجاح',
      saveError: 'فشل في حفظ سير العمل',
      saveSuccess: 'تم حفظ سير العمل بنجاح',
      edit: 'تعديل سير العمل',
      stepStatus: {
        pending: 'قيد الانتظار',
        inProgress: 'قيد التنفيذ',
        completed: 'مكتمل',
        rejected: 'مرفوض'
      },
      addStep: 'إضافة خطوة',
      editStep: 'تعديل الخطوة',
      deleteStep: 'حذف الخطوة',
      stepName: 'اسم الخطوة',
      stepDescription: 'وصف الخطوة',
      stepAssignees: 'المعينون للخطوة',
      stepDueDate: 'تاريخ استحقاق الخطوة',
      stepOrder: 'ترتيب الخطوة',
      moveStepUp: 'نقل الخطوة للأعلى',
      moveStepDown: 'نقل الخطوة للأسفل',
      noSteps: 'لم يتم إضافة خطوات بعد',
      addFirstStep: 'أضف خطوتك الأولى'
    },
    departments: 'الأقسام',
    add_department: 'إضافة قسم',
    edit_department: 'تعديل القسم',
    department_name: 'اسم القسم',
    department_code: 'رمز القسم',
    description: 'الوصف',
    manager: 'المدير',
    no_manager: 'لا يوجد مدير',
    budget_amount: 'مبلغ الميزانية',
    currency: 'العملة',
    fiscal_year: 'السنة المالية',
    department_goals: 'أهداف القسم',
    goal_title: 'عنوان الهدف',
    goal_description: 'وصف الهدف',
    add_goal: 'إضافة هدف',
    error_loading_department: 'خطأ في تحميل بيانات القسم',
    error_saving_department: 'خطأ في حفظ القسم',
    department_saved: 'تم حفظ القسم بنجاح',
    department_deleted: 'تم حذف القسم بنجاح',
    confirm_delete_department: 'هل أنت متأكد من حذف هذا القسم؟',
    department_has_employees: 'هذا القسم لديه موظفين معينين. يرجى إعادة تعيينهم قبل الحذف.',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return value;
  };

  const value = {
    language,
    toggleLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 