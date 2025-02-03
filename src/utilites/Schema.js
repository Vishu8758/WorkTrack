import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Please enter your Email ')
    .trim('Please enter your Email '),
  password: yup
    .string()
    .required('Please enter your Password')
    .trim('Please enter your Password')
    .min(6, "Password must contain atleast 6 chsracters"),
});
export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .required('Please enter your  Name')
    .trim('Please enter your Display Name'),
  email: yup
    .string()
    .required('Please enter your Email ')
    .trim('Please enter your Email'),
  password: yup
    .string()
    .required('Please enter your Password')
    .trim('Please enter your Password')
    .min(6, "Password must contain atleast 6 chsracters"),
  confirmPassword: yup
    .string()
    .required('Please enter your Password')
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .trim('Please enter your Password Again')
    .min(6, "Password must contain atleast 6 chsracters"),
  employeeId: yup
    .string()
    .required('Please enter your Id')
    .trim('Please enter your Id'),
  jobRole: yup
    .string()
    .required('Please enter your Job Role')
    .trim('Please enter Your Job Role')

});
