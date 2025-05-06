import { InOutOperation, ItemInstance, AuditInOutOperation } from '../models/index.js';

export const performOperation = async (req, res) => {
  const { instance_id, type, quantity = 1, remarks = '' } = req.body;
  const userId = req.user.id;

  try {
    const instance = await ItemInstance.findByPk(instance_id);
    if (!instance) return res.status(404).json({ message: 'Item instance not found' });

    const oldData = JSON.stringify(instance.toJSON());

    if (type === 'in') {
      instance.status = 'available';
    } else if (type === 'out') {
      instance.status = 'archived';
    } else if (type === 'borrow') {
      instance.status = 'borrowed';
    } else if (type === 'return') {
      instance.status = 'available';
    } else {
      return res.status(400).json({ message: 'Invalid operation type' });
    }

    await instance.save();

    const operation = await InOutOperation.create({
      instance_id,
      type,
      performed_by: userId,
      quantity,
      remarks,
      timestamp: new Date()
    });

    await AuditInOutOperation.create({
      operation_id: operation.id,
      changed_by: userId,
      operation_type: 'INSERT',
      old_data: oldData,
      new_data: JSON.stringify(instance.toJSON()),
      timestamp: new Date()
    });

    res.json({ message: 'Operation completed successfully', operation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
