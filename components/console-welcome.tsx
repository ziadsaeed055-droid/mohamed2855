'use client'

import { useEffect } from 'react'

export function ConsoleWelcome() {
  useEffect(() => {
    // Create the ASCII art for the console
    const asciiArt = `
    ╔════════════════════════════════════════════════════════════════════════════╗
    ║                                                                            ║
    ║                    🚀 SEVEN BLUE E-COMMERCE PLATFORM 🚀                   ║
    ║                                                                            ║
    ║                  Developed & Engineered by: محمد أيمن                    ║
    ║                      Full-Stack Developer | innovator                      ║
    ║                                                                            ║
    ║                   Welcome to a Premium Shopping Experience                 ║
    ║                                                                            ║
    ╚════════════════════════════════════════════════════════════════════════════╝
    `

    // Main title styling
    const titleStyle = [
      'font-size: 32px',
      'font-weight: 900',
      'color: #0d3b66',
      'text-shadow: 2px 2px 4px rgba(0,0,0,0.3)',
      'font-family: Georgia, serif',
      'letter-spacing: 2px'
    ].join(';')

    const subtitleStyle = [
      'font-size: 18px',
      'font-weight: 700',
      'color: #f4a261',
      'font-family: Arial, sans-serif',
      'letter-spacing: 1px',
      'margin-top: 10px'
    ].join(';')

    const sectionStyle = [
      'font-size: 14px',
      'color: #2c3e50',
      'font-family: Courier New, monospace',
      'line-height: 1.6',
      'padding: 10px 0'
    ].join(';')

    const highlightStyle = [
      'color: #0d3b66',
      'font-weight: bold',
      'font-size: 15px'
    ].join(';')

    const accentStyle = [
      'color: #f4a261',
      'font-weight: bold'
    ].join(';')

    const statsStyle = [
      'font-size: 13px',
      'color: #34495e',
      'font-family: Courier New, monospace',
      'background: rgba(13, 59, 102, 0.05)',
      'padding: 8px 12px',
      'border-radius: 4px',
      'margin: 5px 0',
      'border-left: 3px solid #0d3b66'
    ].join(';')

    const linkStyle = [
      'color: #0d3b66',
      'text-decoration: underline',
      'cursor: pointer',
      'font-weight: bold'
    ].join(';')

    // Print the welcome message
    console.clear()
    
    // Print ASCII Art
    console.log(
      asciiArt,
      'color: #0d3b66; font-size: 12px; font-family: monospace; font-weight: bold'
    )
    
    // Single unified developer name display with image
    console.log(
      '%c\n 👨‍💼 محمد أيمن | Mohamed Ayman\n Full Stack Developer | E-Commerce Specialist\n\n',
      'font-size: 26px; font-weight: 900; color: #0d3b66; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); font-family: Georgia, serif; letter-spacing: 1.5px; margin: 20px 0; line-height: 1.8; text-align: center'
    )
    
    // Add developer image using external URL
    console.log(
      '%cDeveloper Portfolio:',
      'font-size: 14px; font-weight: bold; color: #0d3b66; margin-top: 15px'
    )
    
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0d3b66; font-size: 14px; margin: 20px 0; font-weight: bold')
    
    console.log('%c📱 SYSTEM INFORMATION', 'font-size: 14px; font-weight: bold; color: #0d3b66; margin: 10px 0')
    console.log('%cSeven Blue - Premium Fashion E-Commerce Platform | متجر الملابس الراقية الفاخرة', 'font-size: 12px; color: #34495e; margin: 5px 0')
    console.log('%c🎨 Tech Stack: Next.js 16 • React 19 • TypeScript • Tailwind CSS • Firebase • AI SDK 6', 'font-size: 11px; color: #7f8c8d')
    
    console.log('%c✨ المميزات الرئيسية / Key Features:', accentStyle)
    console.log('%c✓ نظام إدارة منتجات متقدم مع فئات هرمية', statsStyle)
    console.log('%c✓ Advanced product management with hierarchical categories', statsStyle)
    console.log('%c✓ نظام تصفية وبحث ذكي مع معاينة حية', statsStyle)
    console.log('%c✓ Smart filtering & search with live preview', statsStyle)
    console.log('%c✓ Responsive design يعمل على جميع الأجهزة', statsStyle)
    console.log('%c✓ Color-image mapping technology متقدمة', statsStyle)
    console.log('%c✓ Dashboard احترافي لإدارة المتجر', statsStyle)
    console.log('%c✓ Professional dashboard for store management', statsStyle)
    console.log('%c✓ SEO optimization على أعلى مستوى', statsStyle)
    console.log('%c✓ Multi-language support (العربية & English)', statsStyle)
    
    console.log('%c🚀 الأداء / Performance:', accentStyle)
    console.log('%c⚡ Optimized for speed and performance', statsStyle)
    console.log('%c⚡ Advanced caching and database optimization', statsStyle)
    console.log('%c⚡ Real-time updates with Firestore', statsStyle)
    
    console.log('%c🔐 الأمان / Security:', accentStyle)
    console.log('%c🛡️ Secure authentication and authorization', statsStyle)
    console.log('%c🛡️ Protected routes and role-based access', statsStyle)
    console.log('%c🛡️ Data encryption and secure transactions', statsStyle)
    
    console.log('%c📊 الإحصائيات / Statistics:', accentStyle)
    console.log('%c', sectionStyle)
    
    const stats = [
      { label: '📄 الصفحات / Pages', value: '15+' },
      { label: '🏷️ الأقسام / Categories', value: '5' },
      { label: '📦 المنتجات / Products', value: 'Dynamic' },
      { label: '🎨 الألوان المدعومة / Colors', value: '20+' },
      { label: '📱 استجابة للموبايل / Mobile Ready', value: '✓ Yes' }
    ]
    
    stats.forEach(stat => {
      console.log(`%c${stat.label}%c  ${stat.value}`, 'color: #0d3b66; font-weight: bold;', 'color: #f4a261; font-weight: bold; font-size: 14px;')
    })
    
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0d3b66; font-size: 14px; margin: 10px 0')
    
    console.log('%c🎯 البعثة / Mission:', accentStyle)
    console.log('%cإنشاء منصة تجارة إلكترونية احترافية وسهلة الاستخدام', statsStyle)
    console.log('%cتوفير تجربة تسوق رائعة للعملاء مع إدارة فعالة للمتجر', statsStyle)
    
    console.log('%c⏱️ Development Timeline:', accentStyle)
    console.log('%c✓ Architecture Design & Planning', statsStyle)
    console.log('%c✓ Database Schema & Optimization', statsStyle)
    console.log('%c✓ Frontend Components & UI Development', statsStyle)
    console.log('%c✓ Advanced Features Implementation', statsStyle)
    console.log('%c✓ SEO Optimization & Performance Tuning', statsStyle)
    console.log('%c✓ Testing & Quality Assurance', statsStyle)
    
    console.log('%c💡 التطوير / Development:', accentStyle)
    console.log('%cتم تطوير هذا النظام بعناية واهتمام بأدق التفاصيل', statsStyle)
    console.log('%cمع التركيز على الجودة والأداء والتجربة المستخدم', statsStyle)
    
    console.log('%c━━━━━━━━━��━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0d3b66; font-size: 14px; margin: 15px 0')
    
    console.log('%c🌐 الروابط المهمة / Important Links:', highlightStyle)
    console.log('%c📧 Contact: ayman@sevenblue.store', linkStyle)
    console.log('%c🔗 Website: https://sevenblue.store', linkStyle)
    console.log('%c💼 Portfolio: In Development', linkStyle)
    
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0d3b66; font-size: 14px; margin: 10px 0')
    
    console.log('%cشكراً لاستخدام Seven Blue Store!', [
      'font-size: 16px',
      'font-weight: bold',
      'color: #27ae60',
      'font-family: Arial, sans-serif'
    ].join(';'))
    
    console.log('%cThank you for using Seven Blue Store!', [
      'font-size: 16px',
      'font-weight: bold',
      'color: #27ae60',
      'font-family: Arial, sans-serif'
    ].join(';'))
    
    console.log('%cنرجو أن تستمتع بالتجربة 🎉', [
      'font-size: 14px',
      'color: #f4a261',
      'font-style: italic'
    ].join(';'))
    
    console.log('%c', sectionStyle)
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0d3b66; font-size: 14px; margin: 15px 0')
    
    console.log('%c✨ تم تطويره بعناية واهتمام بأدق التفاصيل ✨', [
      'font-size: 15px',
      'font-weight: bold',
      'color: #e74c3c',
      'text-shadow: 1px 1px 2px rgba(0,0,0,0.2)',
      'text-align: center'
    ].join(';'))
    
    console.log('%c💎 Built with passion and innovation 💎', [
      'font-size: 14px',
      'font-weight: bold',
      'color: #f39c12'
    ].join(';'))
    
    console.log('%c', sectionStyle)
    
    // Developer signature with styling
    console.log(
      '%c🎨 Developer Signature:',
      'font-size: 14px; color: #0d3b66; font-weight: bold; font-family: Arial, sans-serif; text-decoration: underline'
    )
    console.log(
      '%cمحمد أيمن | Mohamed Ayman',
      'font-size: 16px; font-weight: 900; color: #0d3b66; font-family: Georgia, serif; letter-spacing: 1px'
    )
    console.log(
      '%cFull Stack Developer | E-Commerce Specialist | UI/UX Designer',
      'font-size: 12px; color: #34495e; font-family: Arial, sans-serif; line-height: 1.6; margin: 5px 0'
    )
    console.log(
      '%cTechnology Stack: Next.js 16 • React 19 • TypeScript • Tailwind CSS • Firebase • Stripe',
      'font-size: 11px; color: #7f8c8d; font-family: Courier New, monospace; background: rgba(13, 59, 102, 0.05); padding: 5px 10px; border-radius: 3px'
    )
    console.log(
      '%c💡 Innovation Focus: Performance • UX • Security • Scalability',
      'font-size: 11px; color: #f4a261; font-family: Courier New, monospace'
    )
    
    console.log('%c', sectionStyle)
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0d3b66; font-size: 14px; margin: 10px 0')
    
    console.log(
      '%c🌟 This application was built with meticulous attention to detail, cutting-edge technologies, and a passion for excellence. 🌟',
      'font-size: 13px; font-weight: bold; color: #27ae60; font-style: italic; text-align: center'
    )
    
    console.log(
      '%cEvery pixel, every interaction, and every line of code was crafted to deliver an exceptional user experience.',
      'font-size: 12px; color: #34495e; font-family: Arial, sans-serif; line-height: 1.8'
    )
    
    console.log('%c', sectionStyle)
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0d3b66; font-size: 14px; margin: 10px 0')
    console.log(
      '%c✨ Enjoy your premium shopping experience! ✨',
      'font-size: 15px; font-weight: bold; color: #f4a261; text-align: center'
    )
    
  }, [])

  return null
}
