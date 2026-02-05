import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = ({ notifications }) => {
  return (
    <div className="notifications-container">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            className="notification"
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <p>{notif.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
