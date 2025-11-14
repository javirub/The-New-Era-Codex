---
title: "AI Invoice Processing: OCR, Data Extraction, Auto-Approval"
description: "Automate invoice processing with AI-powered OCR and intelligent data extraction"
sidebar:
  badge:
    text: "Low"
    variant: note
version: "1.0"
---

# AI Invoice Processing

## Document OCR with Vision AI

```python
import openai
import base64
from pathlib import Path

def extract_invoice_data(image_path):
    """Extract structured data from invoice image"""

    with open(image_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """Extract all information from this invoice.

                        Return as JSON with these fields:
                        - invoice_number
                        - date
                        - vendor_name
                        - vendor_address
                        - total_amount
                        - currency
                        - line_items: [{description, quantity, unit_price, amount}]
                        - tax_amount
                        - payment_terms
                        """
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)
```

## Invoice Validation

```python
def validate_invoice(invoice_data, purchase_order=None):
    """Validate invoice against business rules"""

    validation_errors = []

    # Check required fields
    required = ['invoice_number', 'vendor_name', 'total_amount', 'date']
    for field in required:
        if not invoice_data.get(field):
            validation_errors.append(f"Missing required field: {field}")

    # Validate amount
    if invoice_data.get('total_amount', 0) <= 0:
        validation_errors.append("Invalid total amount")

    # Check against PO if provided
    if purchase_order:
        if invoice_data['total_amount'] > purchase_order['approved_amount'] * 1.1:
            validation_errors.append(
                f"Invoice exceeds PO amount by >10%: "
                f"${invoice_data['total_amount']} vs ${purchase_order['approved_amount']}"
            )

    # AI-powered anomaly detection
    anomaly_check = check_for_anomalies(invoice_data)
    validation_errors.extend(anomaly_check)

    return {
        "valid": len(validation_errors) == 0,
        "errors": validation_errors
    }

def check_for_anomalies(invoice_data):
    """Use AI to detect unusual patterns"""

    prompt = f"""
    Analyze this invoice for potential issues or anomalies:

    {json.dumps(invoice_data, indent=2)}

    Check for:
    - Unusual amounts or pricing
    - Duplicate charges
    - Missing information
    - Inconsistent data

    Return list of concerns, or empty list if none found.
    """

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )

    result = json.loads(response.choices[0].message.content)
    return result.get('anomalies', [])
```

## Auto-Approval Rules

```python
class InvoiceApprovalEngine:
    def __init__(self):
        self.approval_rules = {
            'auto_approve_threshold': 1000,
            'trusted_vendors': ['Vendor A', 'Vendor B'],
            'requires_manager': 5000,
            'requires_cfo': 25000
        }

    def determine_approval_path(self, invoice_data):
        amount = invoice_data['total_amount']
        vendor = invoice_data['vendor_name']

        # Auto-approve small amounts from trusted vendors
        if (amount < self.approval_rules['auto_approve_threshold'] and
            vendor in self.approval_rules['trusted_vendors']):
            return {
                'action': 'auto_approve',
                'approver': 'system',
                'reason': 'Trusted vendor, amount below threshold'
            }

        # Determine required approver
        if amount >= self.approval_rules['requires_cfo']:
            approver = 'CFO'
        elif amount >= self.approval_rules['requires_manager']:
            approver = 'Manager'
        else:
            approver = 'AP Team'

        return {
            'action': 'send_for_approval',
            'approver': approver,
            'priority': 'high' if amount > 10000 else 'normal'
        }

    def process_invoice(self, image_path):
        # Extract data
        invoice_data = extract_invoice_data(image_path)

        # Validate
        validation = validate_invoice(invoice_data)

        if not validation['valid']:
            return {
                'status': 'rejected',
                'errors': validation['errors']
            }

        # Determine approval
        approval = self.determine_approval_path(invoice_data)

        # Execute action
        if approval['action'] == 'auto_approve':
            self.approve_and_schedule_payment(invoice_data)
            return {'status': 'approved', 'invoice': invoice_data}
        else:
            self.send_for_approval(invoice_data, approval['approver'])
            return {'status': 'pending_approval', 'approver': approval['approver']}
```

## Integration with Accounting Software

```python
import requests

def sync_to_quickbooks(invoice_data):
    """Create invoice in QuickBooks"""

    qb_endpoint = "https://quickbooks.api.intuit.com/v3/company/{company_id}/invoice"

    headers = {
        'Authorization': f'Bearer {QB_ACCESS_TOKEN}',
        'Content-Type': 'application/json'
    }

    # Transform to QuickBooks format
    qb_invoice = {
        "Line": [
            {
                "Amount": item['amount'],
                "DetailType": "SalesItemLineDetail",
                "SalesItemLineDetail": {
                    "ItemRef": {"value": "1"},
                    "Qty": item['quantity'],
                    "UnitPrice": item['unit_price']
                },
                "Description": item['description']
            }
            for item in invoice_data['line_items']
        ],
        "CustomerRef": {
            "value": find_or_create_vendor(invoice_data['vendor_name'])
        }
    }

    response = requests.post(qb_endpoint, headers=headers, json=qb_invoice)
    return response.json()
```

## Batch Processing Pipeline

```python
from concurrent.futures import ThreadPoolExecutor
import os

def process_invoice_batch(folder_path):
    """Process all invoices in a folder"""

    invoice_files = list(Path(folder_path).glob("*.pdf")) + \
                   list(Path(folder_path).glob("*.png")) + \
                   list(Path(folder_path).glob("*.jpg"))

    engine = InvoiceApprovalEngine()
    results = []

    def process_single(file_path):
        try:
            result = engine.process_invoice(str(file_path))
            result['file'] = file_path.name
            return result
        except Exception as e:
            return {'file': file_path.name, 'status': 'error', 'error': str(e)}

    with ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(process_single, invoice_files))

    # Generate summary
    summary = {
        'total': len(results),
        'auto_approved': sum(1 for r in results if r.get('status') == 'approved'),
        'pending': sum(1 for r in results if r.get('status') == 'pending_approval'),
        'rejected': sum(1 for r in results if r.get('status') == 'rejected'),
        'errors': sum(1 for r in results if r.get('status') == 'error')
    }

    return {'results': results, 'summary': summary}
```

## n8n Automation Workflow

**Invoice Processing Pipeline**:

1. **Email Trigger**: Watch for invoices in inbox
2. **Extract Attachments**: Get PDF/image files
3. **OpenAI Vision**: Extract invoice data
4. **Validation**: Check business rules
5. **Decision Node**: Auto-approve or route for review
6. **QuickBooks**: Create invoice entry
7. **Slack**: Notify AP team
8. **Google Sheets**: Log all processed invoices

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues)!
