import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; 
import validator from 'validator';


interface IAdmin extends Document {
  adminEmail: string;
  pin: string;
  adminName: string;
  adminRole: string;
  comparePin(candidatePin: string): Promise<boolean>;
}

const adminSchema = new mongoose.Schema<IAdmin>({
  adminName: { type: String, required: true, trim: true },
  pin: { type: String, required: true },
  adminRole: {type:String, required:true},
  adminEmail: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email address']
  },
});

adminSchema.pre('save', async function(next) {
  if (!this.isModified('pin')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.pin = await bcrypt.hash(this.pin, salt);
  next();
});

adminSchema.methods.comparePin = function(candidatePin:string) {
  return bcrypt.compare(candidatePin, this.pin);
};

const Admin = mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin;