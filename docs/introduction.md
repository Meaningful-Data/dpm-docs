# 1 Introduction

This document contains description of the Data Points Metamodel created as a result of the DPM
Refit project, a common initiative of the EBA and EIOPA.

## 1.1 Document history

| Version | Date | Description |
|---|---|---|
| 0.1 | 28/02/2022 | First internal working draft. Presents proposed skeleton of the document structure. Provides description and outlines intended content of each section. This version uses simplified diagrams of the metamodel as their comprehensive form is under finalization at the moment of preparing this first internal draft. |
| 0.2 | 30/06/2022 | Second internal working draft. Extended to cover all sections in more detail as well as updated to resemble the most recent version of the meta-model diagram and status of discussions. |
| 0.21 | 13/07/2022 | Second internal working draft updated with comments and changes to versioning of SubCategories and removal of ItemHierarchy as well as addressing other editorial changes. |
| 0.3 | 30/09/2022 | Third internal working draft including comments from the first review. Metamodel description has been updated and completed for all parts (for metamodel diagram as of 15/09/2022). |
| 0.4 | 14/11/2022 | Fourth internal working draft including updates to the model between 15/09/2022 and 10/11/2022. |
| 0.5 | 14/12/2022 | Internal working draft including updates to the model between 10/11/2022 and 14/12/2022. |
| 0.6 | 31/03/2023 | Internal working draft including some updates to the model between 10/11/2022 and 31/03/2023. |
| 0.7 | 22/05/2023 | Public draft including updates to the model as of 30/04/2023. |

## 1.2 Abbreviations and glossary

| Term | Description |
|---|---|
| COREP | COmmon REPorting framework used by credit institutions and investment firms to report their solvency ratio to NCAs and EBA under the CRR/CRD. It is a part of the EBA DPM model. |
| CRR/CRD | Regulatory reporting regime consisting of the Credit Requirements Directive (CRD IV) and Capital Requirements Regulation (CRR) aiming to improve banks' ability to bear risks by strengthening their solvency and liquidity position as well as their risk management. EBA has been developing DPM models covering CRR/CRD requirements. |
| DPM Model | Data Point Metamodel – in this abbreviation it refers to a metamodel (a model of the model – statements and structures that hold definition of information requirements) and a methodology (understood as a set of standardized methods used to solve certain problem). |
| DPM ML | Data Point Metamodel l Language - structured representation of operations (data quality checks and data transformations rules) in the DPM metamodel and resulting databases. |
| DPM semantics | When followed by word "semantics", DPM refers to specific information definitions required in reporting frameworks (e.g. CRDIV COREP/FINREP, Solvency II, etc) modelled according to the DPM methodology and represented under DPM metamodel; |
| DPM database | Database whose structure follows DPM metamodel and can contain DPM semantical contents. |
| DPM Studio (formerly DRR) | Technical solution that is being developed by the EBA and EIOPA to facilitate definition and management of DPM semantics using the DPM (meta)model as described by this document, including generation of various outputs (e.g. XBRL taxonomies representing information requirements). |
| DPM XL | DPM eXpression Language – formal syntax and grammar for representing operations (data quality checks and data transformations rules) by the EBA and EIOPA under DPM after refit. |
| EBA | European Banking Authority[^1] |
| ECB | European Central Bank[^2] |
| EIOPA | European Insurance and Occupational Pensions Authority[^3] |
| EUCLID | EUCLID stands for European Centralised Infrastructure for Supervisory Data. It is the platform and data infrastructure developed and used by the EBA to gather and analyse regulatory data from a wide range of financial institutions. It covers supervisory, resolution, remuneration and payments data. |
| Eurofiling | Open joint initiative collaborating with regulatory bodies on EU level in regulatory space. Consist of regulatory reporting experts - delegates of NCAs and representatives of market stakeholders – financial institutions, consultancy companies and IT solution providers. Supports developments in regulatory area for transparency and standardization. |
| FINREP | FINancial REPorting framework is used by certain credit institutions, banks and investment firms for prudential reporting following the International Financial Reporting Standards (IFRSs) to NCAs and EBA under the CRR/CRD. It is a part of the EBA DPM model. |
| Information requirements | Description of data requested from reporting entity to be provided to recipients (e.g. international or national competent financial authorities) to support their activities (e.g. supervisory processes or preparation of statistical reports on macro and micro levels). They are typically defined by policy departments in cooperation with data users and published in regulations (e.g. legal acts of European Commission or national legislation). |
| Modeller | A person (usually SME) creating and maintaining DPM semantic definitions. |
| NCA | Regulatory body on the national level; in context of the EU and financial market these are typically Central Banks and Financial Services Authorities. |
| Pension Funds | Information requirements reported by occupational pensions. It is one of the components of the EIOPA DPM contents. |
| PEPP KID/PR | Pan-European Personal Pension Product (PEPP) Key Information Document (KID) and Prudential Reporting (PR). They are components of the EIOPA DPM semantical model. |
| Report | data to be exchanged by reporting entities to regulators based on the DPM semantic definitions |
| Reporting entity | entity whose data is submitted in a report, e.g. financial institutions such as commercial banks, insurance undertakings, investment firms, etc |
| SDMX | Statistical Data and Metadata eXchange[^4] – standard facilitating exchange of statistical metadata and data. |
| SMEs | Subject Matter Experts – persons knowledgeable in certain area; in this document typically in regulatory reporting domain i.e. understanding content of information requirements. |
| SRB | Single Resolution Board[^5] |
| Solvency II | Solvency II is a regime and a reporting framework introduced to harmonize prudential reporting of insurance and reinsurance undertakings in EU. It is the first and major component of the EIOPA DPM model. |
| XBRL | eXtensible Business Reporting Language[^6] – open technical standard enabling metadata and data exchange; applied by the EBA, EIOPA and various NCA for collecting data from filers. |

[^1]: <https://www.eba.europa.eu/>
[^2]: <https://www.ecb.europa.eu/ecb/html/index.en.html>
[^3]: <https://www.eiopa.europa.eu/>
[^4]: <https://sdmx.org/>
[^5]: <https://www.srb.europa.eu/en/about>
[^6]: <https://www.xbrl.org/the-standard/what/an-introduction-to-xbrl/>

## 1.3 Target audience

This document is aimed at all potential users of the DPM of all the stakeholders involved in
processing regulatory data - from initial data definition regulators processes, through its preparation
and reporting by reporting institutions and subsequent storage, analysis and disclosure to all
recipients of regulatory data. It includes people with different roles, including SMEs, policy
regulators, data architects and designers/developers of IT solutions. It serves reporting, collection
and data storage systems, validation and calculation engines, data exploration and disclosures
platforms.

It is assumed that readers of this document are familiar with the current (i.e. pre-Refit) DPM
methodology, metamodel, and DPM models defined by the EBA and EIOPA.

## 1.4 Out of scope of this document

This document focuses on explanation of the DPM metamodel resulting from DPM Refit project,
touching also on its impact on DPM methodology. This document does not cover the following topics
that will be addressed by separate documentation in due time:

- The xBRL Architecture and its mapping of DPM artefacts to XBRL specification and certain
  XBRL taxonomy architecture (e.g. applied by the EBA/EIOPA for serialization in XBRL of
  current DPM models, already published[^7][^8],
- the APIs to provide means for metadata exchange and approaches for standardization of
  definitions (e.g. introduction of a single wide common dictionary on EU level) including
  technological solutions that could be leveraged for these purposes (e.g. registries driven by
  APIs), processes and approaches related to extension of DPM models (e.g. by importing and
  reusing fragments of other models), which will be published in due time,
- the governance of DPM metamodel, which aims to assure collaboration between authorities
  on the maintenance of commonly used DPM Standard metamodel and pursuing the goal of
  enabling DPM to be spread and used by different stakeholders serving its digital processes
  and helping people to better understand regulatory data in all phases of regulatory life cycle.
  This documentation will be published in due time.

[^7]: <https://www.eiopa.europa.eu/tools-and-data/supervisory-reporting-dpm-and-xbrl_en>
[^8]: <https://www.eba.europa.eu/eba-publishes-draft-version-its-revised-taxonomy-architecture>
