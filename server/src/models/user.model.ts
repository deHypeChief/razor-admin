import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; 
import validator from 'validator';


interface IUser extends Document {
    profileImage: string;
    username: string;
    password: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    dob: Date;
    socialAuth: boolean;
    socialToken: string;
    socialType: string;
  comparePin(candidatePin: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
    username: { type: String, required: true },
    password: { type: String },
    email: { type: String, required: true, validate: [validator.isEmail, 'Invalid email address'] },
    fullName: { type: String, trim: true, default: '' },
    phoneNumber: { type: String, default: '' },
    dob: { type: Date, default: Date.now() },
    socialAuth: { type: Boolean, default: false },
    socialToken: { type: String },
    socialType: { type: String },
    profileImage: { type: String, default: '' },
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePin = function(candidatePin:string) {
  return bcrypt.compare(candidatePin, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;