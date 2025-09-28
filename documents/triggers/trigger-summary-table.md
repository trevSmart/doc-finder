# Resumen de Triggers - Tabla de Referencia Rápida

## Triggers por Objeto - Vista Consolidada

| #   | Objeto                             | Trigger                                     | Eventos            | Patrón                     | Estado      | Bypass | Notas                          |
| --- | ---------------------------------- | ------------------------------------------- | ------------------ | -------------------------- | ----------- | ------ | ------------------------------ |
| 1   | Account                            | CSP_AccountTrigger                          | All DML + Undelete | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     | Lógica comentada disponible    |
| 2   | Account                            | ParentCreatedUpdateCreateUpdateChildRecords | BI,BU,AI,AU        | Lógica Directa             | ✅ Activo   | ❌     | Gestión parent-child           |
| 3   | AccountContactRelation             | CSP_AccountContactRelation                  | BI                 | Lógica Directa             | ✅ Activo   | ❌     | Solo debug                     |
| 4   | AccountContactRelation             | CSP_AccountContactRelationTrigger           | BU,AI,AU,AD        | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     |                                |
| 5   | AccountTeamMember                  | CSP_AccountTeamMemberTrigger                | BU,BD,AI,AU,AD     | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     | Lógica comentada               |
| 6   | Asset                              | recursionexample                            | BU                 | Lógica Directa             | ⚠️ Activo   | ❌     | **RECURSIÓN INFINITA**         |
| 7   | Campaign                           | CSP_CampaignTrigger                         | All DML            | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     |                                |
| 8   | CampaignMember                     | CSP_CampaignMemberTrigger                   | All DML            | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     |                                |
| 9   | Case                               | CSP_CaseTrigger                             | All DML + Undelete | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     | Lógica comentada               |
| 10  | Contact                            | CSP_ContactTrigger                          | All DML + Undelete | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     | Lógica comentada               |
| 11  | Contact                            | CSP_trigger_cl                              | All DML + Undelete | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     |                                |
| 12  | Contact                            | CSP_AccountContactRelTrigger                | BU                 | Vacío                      | ❌ Inactivo | ❌     | Sin implementación             |
| 13  | Contact                            | CSP_ChildCreatedUpdateUdateParent           | BI,BU,AI,AU        | Lógica Directa             | ✅ Activo   | ❌     | Gestión parent-child           |
| 14  | ContentDocument                    | POC_ContentDocument                         | AU,BD              | Lógica Directa             | ✅ Activo   | ❌     | Debug para sync externo        |
| 15  | ContentDocumentLink                | POC_CaseContentDocumentLink                 | AI                 | Comentado                  | ❌ Inactivo | ❌     | Handler comentado              |
| 16  | CSP_AdditionalTeam\_\_c            | CSP_AdditionalTeamTrigger                   | All DML            | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     |                                |
| 17  | CSP_AdditionalTeam\_\_c            | cSP_TestingAdditionalTeam                   | AI                 | Comentado                  | ❌ Inactivo | ❌     | Handler comentado              |
| 18  | CSP_AgentAssignmentManagement\_\_c | CSP_AgentAssignmentTrigger                  | BI,AI,BU,AU,BD     | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     |                                |
| 19  | CSP_CAPPersonalized\_\_c           | CSP_CAPPersonalizedTrigger                  | BI,BU,AI,AU        | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     |                                |
| 20  | CSP_PartnerSynchronization\_\_c    | CSP_PartnerSynchronization                  | AI                 | Comentado                  | ❌ Inactivo | ❌     | Batch handler comentado        |
| 21  | CSP_PortfolioManagement\_\_c       | CSP_PortfolioMngtTrigger                    | All DML            | GSP_MetadataTriggerHandler | ✅ Activo   | ✅     | bypassAccTrigger               |
| 22  | CSP_RoutingGeographic\_\_c         | CSP_RoutingGeographicTrigger                | BI,BU,AI,AU        | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     |                                |
| 23  | CSP_VodafoneBusinessTeam\_\_c      | CSP_VodafoneBusinessTeamTrigger             | All DML            | GSP_MetadataTriggerHandler | ✅ Activo   | ✅     | byPassVDFTrigger               |
| 24  | CSP_Workgroup\_\_c                 | CSP_WorkgroupTrigger                        | BI,AI,BD           | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     |                                |
| 25  | CSP_Workqueue\_\_c                 | CSP_WorkqueueTrigger                        | BI,AI,BD           | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     |                                |
| 26  | Lead                               | CSP_LeadTrigger                             | All DML            | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     |                                |
| 27  | Opportunity                        | CSP_OpportunityTrigger                      | All DML + Undelete | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     | Lógica comentada (US 6.2, 6.6) |
| 28  | Opportunity                        | CSP_ValidateOpportunityTrigger              | BU                 | Comentado                  | ❌ Inactivo | ❌     | Handler comentado              |
| 29  | Opportunity                        | OpportunityContactTrigger                   | BI                 | Vacío                      | ❌ Inactivo | ❌     | Sin implementación             |
| 30  | Order                              | CSP_OrderTrigger                            | All DML + Undelete | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     |                                |
| 31  | Order                              | CSP_OrderValidations                        | All DML + Undelete | Mixto                      | ✅ Activo   | ❌     | Lógica comentada + Handler     |
| 32  | Quote                              | CSP_QuoteTrigger                            | All DML + Undelete | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     |                                |
| 33  | Task                               | CSP_TaskTrigger                             | All DML + Undelete | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     |                                |
| 34  | UpgradeStep\_\_c                   | UpgradeStep                                 | BI,BU              | Lógica Directa             | ✅ Activo   | ❌     | Validaciones + Relaciones      |
| 35  | vlocity_cmt**OrchestrationItem**c  | CSP_OrchItem_Trigger                        | AU                 | Lógica Directa             | ✅ Activo   | ❌     | XOM Push Handler               |
| 36  | vlocity_cmt**PaymentMethod**c      | CSP_PaymentMethodTrigger                    | BI,BU              | GSP_MetadataTriggerHandler | ✅ Activo   | ❌     | Lógica comentada               |
| 37  | vlocity_cmt**Premises**c           | CSP_PremisesTrigger                         | BU,AU              | Lógica Directa             | ✅ Activo   | ❌     | Handler específico             |

## Leyenda

### Eventos

- **BI**: before insert
- **BU**: before update
- **BD**: before delete
- **AI**: after insert
- **AU**: after update
- **AD**: after delete
- **Undelete**: after undelete
- **All DML**: before delete, before insert, before update, after insert, after update, after delete

### Estados

- ✅ **Activo**: Trigger funcionando con lógica implementada
- ⚠️ **Activo con Problemas**: Trigger funcionando pero con issues
- ❌ **Inactivo**: Trigger sin lógica o comentado

### Patrones

- **GSP_MetadataTriggerHandler**: Usa el handler centralizado basado en metadata
- **Lógica Directa**: Implementación directa en el trigger
- **Comentado**: Lógica principal está comentada
- **Vacío**: Sin implementación
- **Mixto**: Combinación de patrones

## Estadísticas

| Métrica                               | Cantidad | Porcentaje |
| ------------------------------------- | -------- | ---------- |
| **Total Triggers**                    | 37       | 100%       |
| **Triggers Activos**                  | 29       | 78.4%      |
| **Triggers Inactivos**                | 8        | 21.6%      |
| **Usando GSP_MetadataTriggerHandler** | 23       | 62.2%      |
| **Con Lógica Directa**                | 8        | 21.6%      |
| **Comentados/Vacíos**                 | 6        | 16.2%      |
| **Con Bypass Mechanism**              | 2        | 5.4%       |
| **Con Problemas Identificados**       | 1        | 2.7%       |

## Objetos con Múltiples Triggers

| Objeto                      | Cantidad | Triggers                                                                                            |
| --------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| **Contact**                 | 4        | CSP_ContactTrigger, CSP_trigger_cl, CSP_AccountContactRelTrigger, CSP_ChildCreatedUpdateUdateParent |
| **Opportunity**             | 3        | CSP_OpportunityTrigger, CSP_ValidateOpportunityTrigger, OpportunityContactTrigger                   |
| **Account**                 | 2        | CSP_AccountTrigger, ParentCreatedUpdateCreateUpdateChildRecords                                     |
| **Order**                   | 2        | CSP_OrderTrigger, CSP_OrderValidations                                                              |
| **AccountContactRelation**  | 2        | CSP_AccountContactRelation, CSP_AccountContactRelationTrigger                                       |
| **CSP_AdditionalTeam\_\_c** | 2        | CSP_AdditionalTeamTrigger, cSP_TestingAdditionalTeam                                                |

## Handlers y Clases Principales

| Handler/Clase                         | Triggers | Descripción                                          |
| ------------------------------------- | -------- | ---------------------------------------------------- |
| **GSP_MetadataTriggerHandler**        | 23       | Handler centralizado basado en metadata              |
| **CSP_ChildCreatedUpdateUdateParent** | 1        | Gestión de relaciones parent-child en Contact        |
| **HelperForParentScenario**           | 1        | Gestión de relaciones parent-child en Account        |
| **CSP_XomPushEventHanddler**          | 1        | Handler para orchestration items y sistemas externos |
| **CSP_PremisesTriggerHandler**        | 1        | Handler específico para premises                     |

## Flags de Bypass Identificados

| Flag                                                      | Trigger                         | Objeto                        | Propósito          |
| --------------------------------------------------------- | ------------------------------- | ----------------------------- | ------------------ |
| `CSP_PortfolioMngtHandler.bypassAccTrigger`               | CSP_PortfolioMngtTrigger        | CSP_PortfolioManagement\_\_c  | Bypass condicional |
| `CSP_VodafoneBusinessTeamTriggerHandler.byPassVDFTrigger` | CSP_VodafoneBusinessTeamTrigger | CSP_VodafoneBusinessTeam\_\_c | Bypass condicional |

## Problemas Críticos Identificados

| Problema               | Trigger          | Objeto | Severidad  | Descripción                                                |
| ---------------------- | ---------------- | ------ | ---------- | ---------------------------------------------------------- |
| **Recursión Infinita** | recursionexample | Asset  | 🔴 Crítico | Trigger modifica mismos registros sin control de recursión |

## Recomendaciones Prioritarias

1. **🔴 URGENTE**: Arreglar recursión en `recursionexample` trigger
2. **🟡 Media**: Consolidar triggers múltiples por objeto cuando sea posible
3. **🟡 Media**: Revisar y activar lógica comentada esencial
4. **🟢 Baja**: Eliminar triggers vacíos o implementar lógica necesaria
5. **🟢 Baja**: Documentar uso apropiado de bypass flags
