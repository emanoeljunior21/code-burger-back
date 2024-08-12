import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import authConfig from '../../config/auth';
import User from '../models/User';

class SessionController {
  async store(request, response) {
    
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().min(6).required(),
    });

   
    try {
      await schema.validate(request.body, { abortEarly: false });
    } catch (err) {
      return response.status(400).json({ 
        error: 'Validation fails', 
        messages: err.errors 
      });
    }

    const { email, password } = request.body;

   
    const user = await User.findOne({ where: { email } });

    
    if (!user) {
      return response.status(401).json({ error: 'Incorrect email or password' });
    }

    
    const isSamePassword = await user.checkPassword(password);

    if (!isSamePassword) {
      return response.status(401).json({ error: 'Incorrect email or password' });
    }

    
    const token = jwt.sign({ id: user.id, name: user.name }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    
    return response.status(200).json({
      id: user.id,
      name: user.name,
      email,
      admin: user.admin,
      token,
    });
  }
}

export default new SessionController();
