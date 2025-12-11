import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LayoutEditor from '../components/admin/LayoutEditor';
import GuestAssigner from '../components/admin/GuestAssigner';
import LinkGenerator from '../components/admin/LinkGenerator';
import WhatsAppMessenger from '../components/admin/WhatsAppMessenger';
import ThankYouMessenger from '../components/admin/ThankYouMessenger';
import '../styles/AdminSeatingChart.css';

function AdminSeatingChartPage() {
  const [activeTab, setActiveTab] = useState('layout');

  const tabs = [
    { id: 'layout', label: 'Editor de Layout', icon: '🏛️' },
    { id: 'assign', label: 'Asignar Invitados', icon: '👥' },
    { id: 'links', label: 'Generar Links', icon: '🔗' },
    { id: 'whatsapp', label: 'Enviar WhatsApp', icon: '💬' },
    { id: 'thankyou', label: 'Agradecimientos', icon: '💕' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'layout':
        return <LayoutEditor />;
      case 'assign':
        return <GuestAssigner />;
      case 'links':
        return <LinkGenerator />;
      case 'whatsapp':
        return <WhatsAppMessenger />;
      case 'thankyou':
        return <ThankYouMessenger />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-seating-page">
      <motion.div
        className="admin-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Panel de Administración - Croquis</h1>

        <div className="tabs-header">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="tab-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default AdminSeatingChartPage;
