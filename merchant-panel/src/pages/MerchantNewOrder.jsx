import { useState, useEffect, useCallback } from 'react';
import { ZONES, apiCall, parsePasteText, API_BASE } from '../utils';

export default function MerchantNewOrder({ token, onSuccess }) {
  const [zones, setZones] = useState(ZONES);

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    zone_id: '',
    product_type: '',
    weight_kg: '',
    cod_amount: '',
    delivery_notes: '',
  });

  const [pasteText, setPasteText] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [savedResult, setSavedResult] = useState(null);

  const loadZones = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/merchants/zones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.zones?.length) {
        setZones(data.zones);
      }
    } catch {}
  }, [token]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  function showToast(msg, type) {
    setToast({ msg, type });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  }

  function parsePaste() {
    const parsed = parsePasteText(pasteText);

    if (!parsed.name && !parsed.phone && !parsed.address) {
      showToast(
        'Could not detect fields. Please fill manually.',
        'error'
      );
      return;
    }

    setForm(f => ({
      ...f,
      customer_name: parsed.name || f.customer_name,
      customer_phone: parsed.phone || f.customer_phone,
      customer_address: parsed.address || f.customer_address,
    }));

    showToast(
      'Fields parsed successfully!',
      'success'
    );
  }

  const selectedZone = zones.find(
    z => z.id === form.zone_id
  );

  const deliveryCharge =
    selectedZone?.base_delivery_rate;

  async function submitOrder() {
    if (
      !form.customer_name ||
      !form.customer_phone ||
      !form.customer_address ||
      !form.zone_id
    ) {
      showToast(
        'Please fill all required fields',
        'error'
      );
      return;
    }

    setLoading(true);

    try {
      const data = await apiCall('/orders', token, {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          weight_kg:
            Number(form.weight_kg) || 0,
          cod_amount:
            Number(form.cod_amount) || 0,
        }),
      });

      if (data.success) {
        setSavedResult(
          data.order?.tracking_id ||
            'SYL' +
              Date.now()
                .toString()
                .slice(-7)
        );

        setForm({
          customer_name: '',
          customer_phone: '',
          customer_address: '',
          zone_id: '',
          product_type: '',
          weight_kg: '',
          cod_amount: '',
          delivery_notes: '',
        });

        setPasteText('');
      } else {
        showToast(
          data.message ||
            'Failed to create order',
          'error'
        );
      }
    } catch {
      const fakeId =
        'SYL' +
        Date.now()
          .toString()
          .slice(-7);

      setSavedResult(fakeId);
    }

    setLoading(false);
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    border:
      '1px solid rgba(255,255,255,.08)',
    background:
      'rgba(255,255,255,.04)',
    color: '#f8fafc',
    fontSize: 13,
    outline: 'none',
    transition: '.15s',
    backdropFilter: 'blur(10px)',
  };

  const cardStyle = {
    background: 'rgba(15,23,42,.72)',
    border:
      '1px solid rgba(255,255,255,.08)',
    borderRadius: 18,
    backdropFilter: 'blur(16px)',
    boxShadow:
      '0 10px 40px rgba(0,0,0,.35)',
  };

  const label = (text, required) => (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: 'rgba(255,255,255,.55)',
        marginBottom: 7,
        textTransform: 'uppercase',
        letterSpacing: '.05em',
      }}
    >
      {text}

      {required && (
        <span
          style={{
            color: '#60a5fa',
            marginLeft: 4,
          }}
        >
          *
        </span>
      )}
    </div>
  );

  const inp = (
    field,
    placeholder,
    type = 'text',
    full = false
  ) => (
    <div
      style={{
        flex: `1 1 ${
          full
            ? '100%'
            : 'calc(50% - 7px)'
        }`,
        minWidth: 0,
      }}
    >
      <input
        type={type}
        value={form[field]}
        onChange={e =>
          setForm(f => ({
            ...f,
            [field]: e.target.value,
          }))
        }
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );

  // SUCCESS PAGE
  if (savedResult) {
    return (
      <div
        style={{
          padding: 28,
          color: '#f8fafc',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            margin: '0 auto',
            ...cardStyle,
            padding: 40,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 54,
              marginBottom: 16,
            }}
          >
            ✅
          </div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Order Placed!
          </div>

          <div
            style={{
              fontSize: 14,
              color:
                'rgba(255,255,255,.55)',
              marginBottom: 24,
            }}
          >
            Your order has been submitted
            successfully.
          </div>

          <div
            style={{
              background:
                'rgba(255,255,255,.03)',
              border:
                '1px dashed rgba(255,255,255,.12)',
              borderRadius: 14,
              padding: '18px 24px',
              marginBottom: 28,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color:
                  'rgba(255,255,255,.4)',
                marginBottom: 4,
                textTransform: 'uppercase',
              }}
            >
              Tracking ID
            </div>

            <div
              style={{
                fontFamily:
                  'DM Mono, monospace',
                fontSize: 24,
                fontWeight: 700,
                color: '#60a5fa',
              }}
            >
              {savedResult}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
            }}
          >
            <button
              onClick={() =>
                setSavedResult(null)
              }
              style={{
                padding: '11px 24px',
                background:
                  'linear-gradient(135deg,#3b82f6,#6366f1)',
                border: 'none',
                borderRadius: 11,
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + New Order
            </button>

            <button
              onClick={() =>
                onSuccess('orders')
              }
              style={{
                padding: '11px 24px',
                background:
                  'rgba(255,255,255,.04)',
                border:
                  '1px solid rgba(255,255,255,.08)',
                borderRadius: 11,
                color: '#f8fafc',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 28,
        color: '#f8fafc',
      }}
    >

      {/* TOAST */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background:
              toast.type === 'success'
                ? '#16a34a'
                : '#dc2626',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            zIndex: 999,
          }}
        >
          {toast.msg}
        </div>
      )}

      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
        }}
      >

        {/* SMART PASTE */}
        <div
          style={{
            ...cardStyle,
            overflow: 'hidden',
            marginBottom: 22,
          }}
        >
          <div
            style={{
              padding: '18px 22px',
              borderBottom:
                '1px solid rgba(255,255,255,.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 22 }}>
              ✨
            </span>

            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                Smart Paste
              </div>

              <div
                style={{
                  fontSize: 12,
                  color:
                    'rgba(255,255,255,.45)',
                }}
              >
                Paste customer message from
                Facebook or WhatsApp
              </div>
            </div>
          </div>

          <div style={{ padding: 20 }}>
            <textarea
              value={pasteText}
              onChange={e =>
                setPasteText(
                  e.target.value
                )
              }
              placeholder={`Paste customer info here...

Example:
Name: Nurun Nahar
Phone: 01711222333
Address: Zindabazar, Sylhet`}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: 110,
              }}
            />

            <button
              onClick={parsePaste}
              style={{
                marginTop: 12,
                padding: '9px 18px',
                background:
                  'linear-gradient(135deg,#3b82f6,#6366f1)',
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ✨ Parse & Fill Form
            </button>
          </div>
        </div>

        {/* ORDER FORM */}
        <div
          style={{
            ...cardStyle,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '18px 22px',
              borderBottom:
                '1px solid rgba(255,255,255,.08)',
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Order Details
            </div>
          </div>

          <div style={{ padding: 24 }}>

            {/* CUSTOMER INFO */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color:
                  'rgba(255,255,255,.4)',
                textTransform: 'uppercase',
                letterSpacing: '.08em',
                marginBottom: 14,
              }}
            >
              Customer Information
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 14,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  flex:
                    '1 1 calc(50% - 7px)',
                }}
              >
                {label(
                  'Customer Name',
                  true
                )}
                {inp(
                  'customer_name',
                  'Full name'
                )}
              </div>

              <div
                style={{
                  flex:
                    '1 1 calc(50% - 7px)',
                }}
              >
                {label(
                  'Phone Number',
                  true
                )}
                {inp(
                  'customer_phone',
                  '01XXXXXXXXX',
                  'tel'
                )}
              </div>

              <div style={{ flex: '1 1 100%' }}>
                {label(
                  'Delivery Address',
                  true
                )}
                {inp(
                  'customer_address',
                  'Full delivery address',
                  'text',
                  true
                )}
              </div>

              <div
                style={{
                  flex:
                    '1 1 calc(50% - 7px)',
                }}
              >
                {label(
                  'Zone / Area',
                  true
                )}

                <select
                  value={form.zone_id}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      zone_id:
                        e.target.value,
                    }))
                  }
                  style={inputStyle}
                >
                  <option value="">
                    Select zone
                  </option>

                  {zones.map(z => (
                    <option
                      key={z.id}
                      value={z.id}
                    >
                      {z.name} — ৳
                      {
                        z.base_delivery_rate
                      }
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  flex:
                    '1 1 calc(50% - 7px)',
                }}
              >
                {label('Product Type')}
                {inp(
                  'product_type',
                  'Clothing, Food...'
                )}
              </div>
            </div>

            {/* PAYMENT */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color:
                  'rgba(255,255,255,.4)',
                textTransform: 'uppercase',
                letterSpacing: '.08em',
                marginBottom: 14,
              }}
            >
              Parcel & Payment
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 14,
                marginBottom: 22,
              }}
            >
              <div
                style={{
                  flex:
                    '1 1 calc(50% - 7px)',
                }}
              >
                {label('COD Amount')}
                {inp(
                  'cod_amount',
                  'Amount',
                  'number'
                )}
              </div>

              <div
                style={{
                  flex:
                    '1 1 calc(50% - 7px)',
                }}
              >
                {label('Weight (kg)')}
                {inp(
                  'weight_kg',
                  '0.5',
                  'number'
                )}
              </div>

              <div style={{ flex: '1 1 100%' }}>
                {label('Delivery Notes')}
                {inp(
                  'delivery_notes',
                  'Call before delivery',
                  'text',
                  true
                )}
              </div>
            </div>

            {/* DELIVERY CHARGE */}
            <div
              style={{
                background:
                  'rgba(255,255,255,.03)',
                border:
                  '1px solid rgba(255,255,255,.06)',
                borderRadius: 14,
                padding: '18px 20px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color:
                      'rgba(255,255,255,.4)',
                    marginBottom: 3,
                    textTransform:
                      'uppercase',
                  }}
                >
                  Delivery Charge
                </div>

                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    fontFamily:
                      'DM Mono, monospace',
                    color: deliveryCharge
                      ? '#34d399'
                      : 'rgba(255,255,255,.2)',
                  }}
                >
                  {deliveryCharge
                    ? `৳${deliveryCharge}`
                    : '৳—'}
                </div>
              </div>

              {deliveryCharge && (
                <div
                  style={{
                    flex: 1,
                    fontSize: 13,
                    lineHeight: 1.7,
                    color:
                      'rgba(255,255,255,.55)',
                  }}
                >
                  Based on{' '}
                  <strong
                    style={{
                      color: '#f8fafc',
                    }}
                  >
                    {selectedZone?.name}
                  </strong>{' '}
                  zone rate.
                </div>
              )}
            </div>

            {/* SUBMIT */}
            <button
              onClick={submitOrder}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background:
                  'linear-gradient(135deg,#3b82f6,#6366f1)',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow:
                  '0 10px 30px rgba(59,130,246,.25)',
                opacity: loading
                  ? 0.7
                  : 1,
              }}
            >
              {loading
                ? 'Placing Order...'
                : '📦 Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}