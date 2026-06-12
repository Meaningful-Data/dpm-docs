# 2 DPM Refit project

## 2.1 Goals, history and status quo of DPM

The Data Point Modelling methodology and metamodel were developed with the aim to enable
representation of information requirements by uniquely and explicitly identifying each piece of
reportable data (so-called "data points") using consistently defined terms gathered in subsets
sharing common semantics for their management and maintenance. The set of definitions created
using the DPM methodology and the DPM metamodel are referred to as Data Point Model (DPM).

The primary purpose of the DPM was to support the data exchange by providing means for data
recipients (e.g. regulators) to define requested data, so that reporting entities (e.g. banks or
insurance undertakings) understand better the requirements as was meant by the data definition
modellers.

The development of a standardized approach for metadata modelling according to a common
metamodel started organically under the auspices of the Eurofiling in 2008, taking advantage of
several national implementations, e.g. Matrix model[^9] created and used by the Banca d'Italia (BdI). It
aimed at changing the approach to metadata modelling from form-centric (i.e. driven by data
presentation) to data centric (i.e. focused on data definition irrespective of the way data is rendered
to users).

Another important goal was to shift the data definition exercise from IT specialists to business
domain experts. The first models that followed this approach, back then referred as Data Point
Structures, were developed in 2009 and proved its usability in the context of the development of
FINREP. Several European regulators involved in the Eurofiling initiative started research as a follow-
up to these developments to confirm applicability of the methodology and metamodel in their
specific use cases, including prudential reporting, statistics, credit register, etc. Data Point Models
have been developed at European level by the EBA (CRDIV), EIOPA (Solvency II, Pension Funds, etc.)
as well as by various national competent authorities that extend EBA/EIOPA deliverables or build
their models from scratch, not only in Europe but across the world.

The methodology and metamodel was finally called Data Point Modelling and documented in detail
in the "European Data Point Methodology for Supervisory Reporting"[^10] for the European Committee
for Standardization (CEN). In this form it has been also recently adopted as standard 5116[^11] of the
International Organization for Standardisation (ISO).

Since 2013, EBA and EIOPA have been storing the result of the data definitions of their regulatory
reporting frameworks in a DPM database following their similar specific metamodel structures.

### Challenges and limitations of the current DPM

With increasing number, variety, and size of implementations, DPM has faced several challenges and
a few shortcomings gained importance.

The following is a not-exhausting list of observed challenges for the new DPM.

- The recent trends and changes related to so-called RegTech and SupTech show increasing
  needs of regulators in more precise data definitions (i.e. detailed of definitions) and on
  describing deeper the information need in the infrastructures of the data submitters. At the
  same time, there is a higher stress on boosting more powerful analytical usage of this
  information in Business Intelligence solutions and in particularly on the use of Artificial
  Intelligence and Machine Learning techniques. Therefore, the potential application and
  utility of the reporting chain based on DPM is much wider than initially targeted.
- The DPM versioning and historization mechanisms have been an important feature which
  can be improved. This is a core aspect for Regulators as regulatory reporting not only needs
  to evolve easily across time but also to be able to track back each piece of information for
  analytical purposes.
- Defining and maintaining data quality checks (data validations) and data derivations
  (calculation or transformations) can be improved in order to share uniform formats
  implementations and less resource-consuming task for both regulators and reporting
  entities.
- DPM is technology-neutral and should be unbiased by any technical implementation. The
  extensible Business Reporting Language (XBRL) standard that has been used in the majority
  of DPM implementations on a technical level do not need to include structures and
  properties that are required for its subsequent use in serialization as XBRL taxonomies. XBRL
  is currently going through phases of technological evolutions aimed at decoupling semantics
  from syntax. This initiative called Open Information Model (OIM) already delivered
  specifications for data exchange using JSON and CSV (in addition to XBRL-XML) and works
  are planned to do the same for XBRL taxonomies. Moreover, it is expected and desired that
  a modelling methodology, such as the DPM, shall support various other formats commonly
  used for financial data exchange, for example SDMX.
- The implementations of DPM are not unified. Heterogeneous solutions have been
  developed in terms of models, processes, formats, and software solutions. Even for
  applications that commenced approximately at the same time and were carried by two
  sister organizations - EBA and EIOPA – their DPM models have no harmonised components
  at the moment, and each has specific flavours. This resulted from various factors, including
  but not limited to, 1) the nature of requested data, which is more granular in Solvency II
  compared to Capital Requirements Directive (CRD) IV, with many "open" tables; and 2) the
  fact that CRD / Capital Requirements Regulation (CRR) is comprised of less homogenous
  frameworks (Common Reporting (COREP), Financial Reporting (FINREP), etc.) which in
  Solvency II instead were consolidated under a single framework, enabling a more
  predictable scheduling of releases and life cycles. These above resulted in entirely
  independent developments and models not only not sharing common definitions but also
  differing significantly in some of the basic modelling approaches (e.g. the construction of
  metrics), publication formats, etc.
- There is a number of features that were not known/required to be address when creating
  DPM and that gained on importance during its use in production. These include the DPM
  model relate to the need of defining relationships between normalized open tables or
  linking table variants, the ability to define terms whose definition comprises of a few other
  terms (so called compound terms), defining relations between data points, modelling of
  value restrictions, etc.

As a result of the above challenges and taking advantage of other important developments and
revamps conduced or planned (e.g. European Centralized Infrastructure for Supervisory Data
(EUCLID)[^12], Solvency 2020 review[^13], XBRL Open Information Model (OIM) specifications[^14]), EBA and
EIOPA decided to commence works on the DPM Refit initiative to further facilitate understanding
and exchange of data in financial sector.

## 2.2 Aim and deliverables of DPM Refit

The DPM Refit project is aimed at enhancing DPM to continue successfully serving its role as a
methodology and metamodel for metadata modelling while overcoming some of its known
limitation and addressing missing functionalities.

In addition to redesigning the DPM metamodel to cope with its known shortcomings and
foreseeable challenges, DPM after refit shall:

- provide means for creation of a unified metamodel that is independent of the purpose,
  characteristics or scope of data (e.g. prudential, statistical, transactional, reference and
  master), covering from highly aggregated data points up to very granular data sets,
- support various data exchange standards (as a result of being defined in technology agnostic
  manner); in particular XBRL and SDMX,
- better support the whole reporting lifecycle, from data definition and metadata
  management, to data collection, exploration, derivation, and dissemination. These are the
  core components of metadata-driven reporting platforms, providing foundations for the
  development of solutions for the definition and application of DPM models,
- enable consistent modelling of EBA and EIOPA reporting requirements and thus a
  convergence of methods, models, processes and tools used for the development of data
  dictionaries and related regulatory products.
- Enable consistent modelling of other regulatory frameworks that need to be integrated
  assuring non redundancy, efficient use of ressources and better availability of data

Discussions about the DPM Refit were initiated by the EBA and EIOPA in the fall 2019 and continue
with the active participation of delegates, of the ECB and, since the DPM Refit workshop held in
December 2021, with inputs from NCAs.

The year 2020 was focussed on the definition of requirements and discussions about the metamodel
of DPM Refit, addressing core content, i.e., the identification of information requirements using
glossary terms and arranged in tables. In 2021 the metamodel was enhanced with the definition of
an approach for metadata historization and the inclusion of operations that are relevant for data
quality checks and data derivation rules). These developments were announced to the NCAs in a
workshop in March 2022 and publicly during Eurofiling Online Session in June 2022[^15]. Further works
in the summer of 2022 resulted in the finalization of the approach as regards the ownership of
definitions, translations and assigning concepts with references (e.g., to legislation or other
underlying documentation). The resulting DPM Refit metamodel diagrams are described in this
documentation.

At the moment of the preparation of this documentation, the DPM Refit metamodel has been also
undergoing severe testing using a set of use cases and through migrating of existing DPM models to
the DPM Refit structures (and vice versa to ensure parallel support during transition period).

[^9]: See <https://www.bancaditalia.it/statistiche/raccolta-dati/sistema-informativo-statistico/modellazione/matrixmod.pdf>
[^10]: <http://cen.eurofiling.info/> : <http://cen.eurofiling.info/wp-content/upLoads/data/CWA_XBRL_WI001-1-E.pdf>
[^11]: <https://www.iso.org/standard/80873.html>
[^12]: <https://www.eba.europa.eu/sites/default/documents/files/document_library/News%20and%20Press/Communication%20materials/Factsheets/1025098/Factsheet%20on%20EUCLID.pdf>
[^13]: <https://www.eiopa.europa.eu/browse/solvency-ii/2020-review-of-solvency-ii_en>
[^14]: <https://www.xbrl.org/the-standard/what/introducing-the-oim/>
[^15]: <https://2022.eurofiling.info/>
